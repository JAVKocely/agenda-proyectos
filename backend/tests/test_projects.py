from app.domain.enums import ProjectStatus, TaskStatus


def test_create_and_get_project_crud(client):
    # 1. Crear proyecto
    payload = {
        "title": "Migración a Microservicios",
        "description": "Desacoplar el monolito en 3 servicios independientes",
        "status": "active",
        "estimated_completion_days": 21
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["title"] == payload["title"]
    assert created["total_tasks"] == 0
    assert created["progress_percentage"] == 0.0
    project_id = created["id"]

    # 2. Obtener por ID
    get_res = client.get(f"/api/v1/projects/{project_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == project_id

    # 3. Listar proyectos
    list_res = client.get("/api/v1/projects")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_reactive_progress_calculation(client):
    """
    Verifica que el progreso cambie reactivamente:
    0 de 4 -> 0.0%
    2 de 4 -> 50.0%
    4 de 4 -> 100.0%
    """
    # 1. Crear proyecto inicial
    project_payload = {
        "title": "Lanzamiento App Móvil",
        "description": "App para iOS y Android"
    }
    res = client.post("/api/v1/projects", json=project_payload)
    project_id = res.json()["id"]

    # 2. Agregar 4 tareas
    task_ids = []
    for i in range(1, 5):
        t_res = client.post(
            f"/api/v1/projects/{project_id}/tasks",
            json={"title": f"Fase {i}", "order": i, "priority": "medium"}
        )
        assert t_res.status_code == 201
        task_ids.append(t_res.json()["id"])

    # Verificar 0%
    detail = client.get(f"/api/v1/projects/{project_id}").json()
    assert detail["total_tasks"] == 4
    assert detail["completed_tasks"] == 0
    assert detail["progress_percentage"] == 0.0

    # Completar 2 tareas -> debe ser 50.0%
    client.patch(f"/api/v1/tasks/{task_ids[0]}", json={"status": "completed"})
    client.patch(f"/api/v1/tasks/{task_ids[1]}", json={"status": "completed"})

    detail = client.get(f"/api/v1/projects/{project_id}").json()
    assert detail["completed_tasks"] == 2
    assert detail["progress_percentage"] == 50.0

    # Completar las restantes 2 tareas -> debe ser 100.0%
    client.patch(f"/api/v1/tasks/{task_ids[2]}", json={"status": "completed"})
    client.patch(f"/api/v1/tasks/{task_ids[3]}", json={"status": "completed"})

    detail = client.get(f"/api/v1/projects/{project_id}").json()
    assert detail["completed_tasks"] == 4
    assert detail["progress_percentage"] == 100.0


def test_cascade_deletion(client):
    # Crear proyecto con 2 tareas
    p_res = client.post("/api/v1/projects", json={"title": "Proyecto Temporal"})
    project_id = p_res.json()["id"]

    t_res = client.post(f"/api/v1/projects/{project_id}/tasks", json={"title": "Tarea 1"})
    task_id = t_res.json()["id"]

    # Eliminar proyecto
    del_res = client.delete(f"/api/v1/projects/{project_id}")
    assert del_res.status_code == 200

    # Verificar que el proyecto ya no existe
    assert client.get(f"/api/v1/projects/{project_id}").status_code == 404

    # Verificar que la tarea fue eliminada en cascada
    assert client.get(f"/api/v1/tasks/{task_id}").status_code == 404


def test_multi_user_data_isolation(client):
    """
    Verifica que los datos de MELI y JHON están 100% aislados.
    Meli no puede ver los proyectos de Jhon, y Jhon no puede ver los de Meli.
    """
    # Meli crea un proyecto
    res_meli = client.post(
        "/api/v1/projects",
        json={"title": "Proyecto Secreto de Meli"},
        headers={"X-User-Id": "meli"}
    )
    assert res_meli.status_code == 201
    meli_proj_id = res_meli.json()["id"]

    # Jhon crea un proyecto
    res_jhon = client.post(
        "/api/v1/projects",
        json={"title": "Proyecto Privado de Jhon"},
        headers={"X-User-Id": "jhon"}
    )
    assert res_jhon.status_code == 201
    jhon_proj_id = res_jhon.json()["id"]

    # Meli lista proyectos: solo debe ver el suyo
    meli_list = client.get("/api/v1/projects", headers={"X-User-Id": "meli"}).json()
    meli_titles = [p["title"] for p in meli_list]
    assert "Proyecto Secreto de Meli" in meli_titles
    assert "Proyecto Privado de Jhon" not in meli_titles

    # Jhon lista proyectos: solo debe ver el suyo
    jhon_list = client.get("/api/v1/projects", headers={"X-User-Id": "jhon"}).json()
    jhon_titles = [p["title"] for p in jhon_list]
    assert "Proyecto Privado de Jhon" in jhon_titles
    assert "Proyecto Secreto de Meli" not in jhon_titles

    # Jhon no puede acceder por ID al proyecto de Meli
    assert client.get(f"/api/v1/projects/{meli_proj_id}", headers={"X-User-Id": "jhon"}).status_code == 404

    # Meli no puede acceder por ID al proyecto de Jhon
    assert client.get(f"/api/v1/projects/{jhon_proj_id}", headers={"X-User-Id": "meli"}).status_code == 404


def test_user_creation_and_dynamic_isolation(client):
    """
    Verifica que se pueden crear nuevos usuarios dinámicamente y que sus datos
    quedan 100% aislados de cualquier otro usuario existente.
    """
    # 1. Listar usuarios: deben existir por defecto meli y jhon
    res_users = client.get("/api/v1/users")
    assert res_users.status_code == 200
    users = res_users.json()
    user_ids = [u["id"] for u in users]
    assert "meli" in user_ids
    assert "jhon" in user_ids

    # 2. Crear un nuevo usuario: "Carlos"
    create_res = client.post(
        "/api/v1/users",
        json={"name": "Carlos Gomez", "color": "emerald"}
    )
    assert create_res.status_code == 201
    new_user = create_res.json()
    assert new_user["id"].startswith("carlos")
    assert new_user["name"] == "Carlos Gomez"
    assert new_user["color"] == "emerald"

    # 3. Carlos crea su propio proyecto
    carlos_id = new_user["id"]
    res_carlos = client.post(
        "/api/v1/projects",
        json={"title": "Proyecto de Carlos"},
        headers={"X-User-Id": carlos_id}
    )
    assert res_carlos.status_code == 201
    carlos_proj_id = res_carlos.json()["id"]

    # 4. Carlos solo ve su proyecto
    carlos_list = client.get("/api/v1/projects", headers={"X-User-Id": carlos_id}).json()
    assert len(carlos_list) == 1
    assert carlos_list[0]["title"] == "Proyecto de Carlos"

    # 5. Jhon o Meli no pueden ver el proyecto de Carlos
    jhon_list = client.get("/api/v1/projects", headers={"X-User-Id": "jhon"}).json()
    assert carlos_proj_id not in [p["id"] for p in jhon_list]

    # 6. Intentar eliminar a meli o jhon debe arrojar error 400
    assert client.delete("/api/v1/users/meli").status_code == 400
    assert client.delete("/api/v1/users/jhon").status_code == 400

    # 7. Eliminar usuario Carlos y verificar cascada
    del_res = client.delete(f"/api/v1/users/{carlos_id}")
    assert del_res.status_code == 200
    assert client.get(f"/api/v1/projects/{carlos_proj_id}").status_code == 404

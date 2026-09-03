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

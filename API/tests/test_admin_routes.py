import json
import random

# O 'client' (Insomnia virtual) é injetado automaticamente do conftest.py
def test_admin_auth_flow(client):
    """
    Testa o fluxo completo:
    1. Registar um 'gerente'
    2. Fazer login como 'gerente'
    3. Tentar aceder a uma rota de 'dono' (e falhar)
    4. Tentar aceder a uma rota de 'gerente' (e ter sucesso)
    """
    
    # Use um email aleatório para que o teste possa rodar várias vezes
    random_email = f"teste_gerente_{random.randint(1000, 9999)}@teste.com"
    
    # --- 1. Teste do Registo (POST /admin/register) ---
    response_reg = client.post('/admin/register', json={
        "name": "Gerente de Teste",
        "email": random_email,
        "password": "senha123",
        "type": "gerente"
    })
    
    # 'assert' verifica se a condição é verdadeira. Se for falsa, o teste falha.
    assert response_reg.status_code == 201
    data_reg = response_reg.json
    assert data_reg["email"] == random_email
    
    # Guardamos o ID do novo utilizador
    user_id = data_reg["idUser"]

    # --- 2. Teste do Login (POST /admin/login) ---
    response_login = client.post('/admin/login', json={
        "email": random_email,
        "password": "senha123"
    })
    
    assert response_login.status_code == 200
    data_login = response_login.json
    assert "access_token" in data_login
    
    # Guardamos o token do 'gerente'
    token = data_login["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # --- 3. Teste de Permissão (GET /admin/readAll - Rota do 'dono') ---
    response_dono = client.get('/admin/readAll', headers=headers)
    
    # Esperamos um 403 (Proibido) porque o nosso token é de 'gerente'
    assert response_dono.status_code == 403
    assert "Acesso negado" in response_dono.json["error"]

    # --- 4. Teste de Permissão (GET /admin/read/<id> - Rota do 'gerente') ---
    response_gerente = client.get(f'/admin/read/{user_id}', headers=headers)
    
    # Esperamos um 200 (OK) porque 'gerente' pode aceder
    assert response_gerente.status_code == 200
    assert response_gerente.json["email"] == random_email
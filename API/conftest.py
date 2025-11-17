import pytest
from app import createApp

@pytest.fixture(scope='module')
def app():
    # Cria uma instância da sua aplicação Flask para os testes.

    app = createApp()
    app.config.update({
        "TESTING": True,
    })

    yield app

@pytest.fixture
def client(app):
    # cria um 'cliente de teste' (o nosso 'INSOMNIA virtual').

    return app.test_client()
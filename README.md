# 🍔 EasyOrder - Sistema de Cardápio Digital Inteligente

![Badge em Desenvolvimento](http://img.shields.io/static/v1?label=STATUS&message=MVP%20FINALIZADO&color=GREEN&style=for-the-badge)
![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)

> **Documentação Técnica Oficial**  
> *Projeto de Banco de Dados orientado pelos professores **Tacyana Batista** e **Wagner Oliveira**.*

O **EasyOrder** é uma solução completa para automação de restaurantes, composta por uma API robusta em Python e um Front-End moderno em Angular. O sistema permite a gestão administrativa (cardápio, mesas, equipe, cozinha) e oferece uma experiência *mobile-first* para os clientes realizarem pedidos via QR Code.

---

# 🎯 Visão Geral (Minimundo)

1. **Cliente:** escaneia o QR Code, acessa o cardápio, personaliza o pedido, faz login simplificado e acompanha o status.  
2. **Cozinha:** recebe pedidos instantaneamente em painel Kanban.  
3. **Gestão:** controla cardápio, mesas, equipe e faturamento.

---

# 🚀 Tecnologias Utilizadas

## Back-End
- Python 3.11+
- Flask
- PostgreSQL
- JWT + RBAC
- psycopg2-binary, flask-bcrypt, flask-cors

## Front-End
- Angular 19
- Angular Material
- Firebase Storage
- angularx-qrcode

---

# 📂 Estrutura do Banco de Dados

Tabelas: usersAdmin, clients, desks, menuItems, orders, orderItems

---

# 🛠️ Instalação

## Back-End
```
cd API
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Criar arquivo .env:
```
DATABASE_URL=postgresql://usuario:senha@host/banco
JWT_SECRET_KEY=sua_chave_secreta
```

Rodar:
```
python main.py
```

## Front-End
```
cd EasyOrderWeb
npm install --legacy-peer-deps
ng serve
```

---

# 📊 SQL Principal

## DDL
```
CREATE TABLE orders (
    idOrder SERIAL PRIMARY KEY,
    idClient INT,
    idDesk INT,
    timeDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status orderStatus DEFAULT 'recebido',
    total DECIMAL(10,2) NOT NULL,
    observation TEXT,
    origin orderOrigin DEFAULT 'app',
    FOREIGN KEY (idClient) REFERENCES clients(idClient),
    FOREIGN KEY (idDesk) REFERENCES desks(idDesk)
);
```

## DML
```
INSERT INTO orderItems (idOrder, idItem, amount, unitPrice, custom, observation)
VALUES 
    (10, 1, 1, 28.90, '{"Ponto": "Ao Ponto"}', 'Sem cebola'),
    (10, 2, 1, 10.00, NULL, NULL);
```

## DQL
```
SELECT 
    o.idOrder, o.status, o.total, o.timeDate, o.observation, 
    d.deskNumber, c.name AS clientName
FROM orders o
LEFT JOIN desks d ON o.idDesk = d.idDesk
LEFT JOIN clients c ON o.idClient = c.idClient
WHERE o.status NOT IN ('entregue', 'cancelado')
ORDER BY o.timeDate DESC;
```

---

# 📘 Conclusão

Projeto completo do banco de dados do EasyOrder com modelagem, DDL, DML, DQL e estrutura do sistema.

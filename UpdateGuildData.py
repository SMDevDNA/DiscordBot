import http.client
import json
import os

# Функція для читання даних з Lua файлу
def read_lua_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

# Отримуємо шлях до домашньої папки користувача
user_profile = os.environ.get('USERPROFILE', '')  # Це дасть шлях до домашньої папки користувача

# Путь до Lua файлу
file_path = os.path.join(user_profile, r"Documents\\Elder Scrolls Online\\live\\SavedVariables\\GuildDataWorker.lua")

# Встановіть URL вашого сервера
host = "localhost"
port = 3000
url = "/updateLuaData"

# Читаємо дані з Lua файлу
lua_data = read_lua_file(file_path)

# Підготовка даних для POST запиту
payload = {
    "data": lua_data
}

# Перетворюємо дані в JSON
json_data = json.dumps(payload)

# Створюємо з'єднання з сервером
conn = http.client.HTTPConnection(host, port)

# Встановлюємо заголовки для запиту
headers = {'Content-type': 'application/json'}

# Відправка POST запиту
conn.request("POST", url, body=json_data, headers=headers)

# Отримуємо відповідь від сервера
response = conn.getresponse()

# Перевірка відповіді
if response.status == 200:
    print("Дані успішно надіслані!")
else:
    print(f"Помилка при відправці даних: {response.status}")
    print(response.read().decode())

# Закриваємо з'єднання
conn.close()
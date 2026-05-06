import { parseModelOutput } from "./src/lib/parser.ts";

const rawKanban = `Название: SEO-статьи для блога

Описание:
- Цель: Увеличить органический трафик на сайт
- Объект: Блог на сайте`;

console.log("Kanban parsed:");
console.log(JSON.stringify(parseModelOutput("kanban", rawKanban), null, 2));

const rawSplit = `1. Определить темы и семантику статей
- Результат: Список тем статей с ключевыми словами и частотностью запросов
- Done-критерий: Согласован список из N тем
- Длительность: 2–3 дня
- Нужна ли до следующего шага: true

2. Составить контент-план
- Результат: Таблица с темами
- Done-критерий: Контент-план согласован
- Длительность: 1 день
- Нужна ли до следующего шага: true`;

console.log("Split parsed:");
console.log(JSON.stringify(parseModelOutput("split", rawSplit), null, 2));

const rawAudit = `1. Да
2. Нет
3. Нет
4. Нет
5. Нет
6. Да
7. Да
8. Написать 1 статью`;

console.log("Audit parsed:");
console.log(JSON.stringify(parseModelOutput("audit", rawAudit), null, 2));

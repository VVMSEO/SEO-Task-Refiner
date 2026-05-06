import { parseModelOutput } from "./src/lib/parser.ts";

async function testMode(mode: string, input: string) {
    const prompts: Record<string, string> = {
        refine: "Ты опытный project-менеджер. Разбей задачу пользователя по Фреймворку из 9 пунктов. Верни СТРОГО нумерованный список из 9 строк (без пустых строк и лишнего текста):\n1. Название задачи\n2. Цель задачи\n3. Объект изменения\n4. Артефакт (результат)\n5. Done-критерий\n6. Малый шаг (MVP)\n7. Что НЕ входит\n8. Метрика проверки\n9. Следующая задача",
        split: "Ты опытный product-менеджер. Раздели задачу пользователя на конкретные шаги/эпики. Формат ответа СТРОГО следующий для каждого шага:\n1. Название шага\n- Результат: [текст]\n- Done-критерий: [текст]\n- Длительность: [текст]\n- Нужна ли до следующего шага: [true/false]",
        kanban: "Ты agile-коуч. Сформируй карточку для kanban-доски на основе ввода пользователя. Строгий формат ответа:\nНазвание: [Короткое название]\nОписание:\n- Цель: [текст]\n- Объект: [текст]\n- Артефакт: [текст]\n- Готово, когда: [текст]\n- Малый шаг: [текст]\n- Метрика проверки: [текст]",
        audit: "Ты QA/Senior менеджер. Сделай аудит постановки задачи пользователя по 8 критериям. Верни ТОЛЬКО нумерованный список из 8 строк (ответов на вопросы), где 8й пункт - это переписанная задача:\n1. Есть ли конкретное действие? (Да/Нет/Отзыв)\n2. Описан ли объект? (Да/Нет/Отзыв)\n3. Понятен ли артефакт? (Да/Нет)\n4. Есть ли Done-критерий? (Да/Нет)\n5. Оптимален ли размер задачи?\n6. Можно ли выделить малый шаг?\n7. Есть ли размытые фразы?\n8. [Идеально переписанная задача]"
    };

    const systemPrompt = prompts[mode];
    
    console.log(`\n\n--- Testing ${mode} ---`);
    const resp = await fetch("https://routerai.ru/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer sk-idWLIk8WBHJJiwn-Y2oyMNdW0ckjsfIa",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "anthropic/claude-sonnet-4.6",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: input }
            ]
        })
    });
    
    const json = await resp.json();
    const rawContent = json.choices?.[0]?.message?.content;
    console.log("RAW OUTPUT:");
    console.log(rawContent);
    const parsed = parseModelOutput(mode as any, rawContent || "");
    console.log("\nPARSED OUTPUT:");
    console.log(JSON.stringify(parsed, null, 2));
}

async function run() {
    const userInput = "Написать статьи про SEO для блога и выложить на сайт";
    await testMode("refine", userInput);
    await testMode("split", userInput);
    await testMode("kanban", userInput);
    await testMode("audit", userInput);
}

run();

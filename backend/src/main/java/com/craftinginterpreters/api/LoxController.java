package com.craftinginterpreters.api;

import com.craftinginterpreters.lox.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/lox")
@CrossOrigin(origins = "${frontend.url}")
public class LoxController {

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeLoxCode(@RequestBody Map<String, String> request) {
        String source = request.get("code");

        if (source == null || source.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Code is required"
            ));
        }

        // Capture output and errors
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ByteArrayOutputStream errorStream = new ByteArrayOutputStream();

        PrintStream originalOut = System.out;
        PrintStream originalErr = System.err;

        try {
            System.setOut(new PrintStream(outputStream));
            System.setErr(new PrintStream(errorStream));

            // Reset error flags
            Lox.hadError = false;
            Lox.hadRuntimeError = false;

            // Create new interpreter instance for each execution
            Interpreter interpreter = new Interpreter();

            // Execute the Lox code
            Scanner scanner = new Scanner(source);
            List<Token> tokens = scanner.scanTokens();

            Parser parser = new Parser(tokens);
            List<Stmt> statements = parser.parse();

            if (Lox.hadError) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "error", errorStream.toString(),
                        "output", outputStream.toString()
                ));
            }

            Resolver resolver = new Resolver(interpreter);
            resolver.resolve(statements);

            if (Lox.hadError) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "error", errorStream.toString(),
                        "output", outputStream.toString()
                ));
            }

            interpreter.interpret(statements);

            if (Lox.hadRuntimeError) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "error", errorStream.toString(),
                        "output", outputStream.toString()
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "output", outputStream.toString(),
                    "error", ""
            ));

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "Runtime error: " + e.getMessage(),
                    "output", outputStream.toString()
            ));
        } finally {
            // Restore original streams
            System.setOut(originalOut);
            System.setErr(originalErr);
        }
    }

    @GetMapping("/examples")
    public ResponseEntity<Map<String, Object>> getExamples() {
        Map<String, String> examples = new HashMap<>();

        examples.put("Hello World",
                "print \"Hello, World!\";"
        );

        examples.put("Variables",
                "var name = \"Lox\";\n" +
                        "var version = 1.0;\n" +
                        "print \"Language: \" + name;\n" +
                        "print \"Version: \" + version;"
        );

        examples.put("Functions",
                "fun greet(name) {\n" +
                        "    return \"Hello, \" + name + \"!\";\n" +
                        "}\n\n" +
                        "print greet(\"World\");\n" +
                        "print greet(\"Lox\");"
        );

        examples.put("Classes",
                "class Person {\n" +
                        "    init(name, age) {\n" +
                        "        this.name = name;\n" +
                        "        this.age = age;\n" +
                        "    }\n\n" +
                        "    introduce() {\n" +
                        "        print \"Hi, I'm \" + this.name + \" and I'm \" + this.age + \" years old.\";\n" +
                        "    }\n" +
                        "}\n\n" +
                        "var person = Person(\"Alice\", 30);\n" +
                        "person.introduce();"
        );

        examples.put("Control Flow",
                "var x = 10;\n\n" +
                        "if (x > 5) {\n" +
                        "    print \"x is greater than 5\";\n" +
                        "} else {\n" +
                        "    print \"x is not greater than 5\";\n" +
                        "}\n\n" +
                        "for (var i = 1; i <= 5; i = i + 1) {\n" +
                        "    print \"Count: \" + i;\n" +
                        "}"
        );

        examples.put("Fibonacci",
                "fun fibonacci(n) {\n" +
                        "    if (n <= 1) return n;\n" +
                        "    return fibonacci(n - 1) + fibonacci(n - 2);\n" +
                        "}\n\n" +
                        "for (var i = 0; i < 10; i = i + 1) {\n" +
                        "    print \"fibonacci(\" + i + \") = \" + fibonacci(i);\n" +
                        "}"
        );

        return ResponseEntity.ok(Map.of(
                "examples", examples
        ));
    }
}
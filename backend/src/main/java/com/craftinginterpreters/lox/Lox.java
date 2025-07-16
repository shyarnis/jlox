package com.craftinginterpreters.lox;

public class Lox {
    public static boolean hadError = false;
    public static boolean hadRuntimeError = false;
     // private static final Interpreter interpreter = new Interpreter();

    // indicate an error in exit code
    /* private static void runFile(String path) throws IOException {
        byte[] bytes = Files.readAllBytes(Paths.get(path));
        run(new String(bytes, Charset.defaultCharset()));
        if (hadError) System.exit(65);
        if (hadRuntimeError) System.exit(70);
    } */

    /* private static void runPrompt() throws IOException {
        InputStreamReader input = new InputStreamReader(System.in);
        BufferedReader reader = new BufferedReader(input);

        for(;;) {
            System.out.print("> ");
            String line = reader.readLine();
            if (line == null) {
                break;
            }
            run(line);
            hadError = false;
        }
    } */

    /* private static void run(String source) {
        Scanner scanner = new Scanner(source);
        List<Token> tokens = scanner.scanTokens();
        // System.out.println(tokens);

        Parser parser = new Parser(tokens);
        // Expr expression = parser.parse();
        List<Stmt> statements = parser.parse();

        // stop if there was s syntax error
        if (hadError) return;

        Resolver resolver = new Resolver(interpreter);
        resolver.resolve(statements);

        // Stop if there was a resolution error.
        if (hadError) return;

        interpreter.interpret(statements);

        // print just token
        // for (Token token: tokens) {
        //     System.out.println(token);
        // }
    } */

    static void error(int line, String message) {
        report(line, "", message);
    }

    private static void report(int line, String where, String message) {
        System.err.println("[line " + line + "] Error" + where + ": " + message);
        hadError = true;
    }

    static void error(Token token, String message) {
        if (token.tokenType == TokenType.EOF) {
            report(token.line, " at end", message);
        } else {
            report(token.line, " at '" + token.lexeme + "'", message);
        }
    }

    static void runtimeError(RuntimeError error) {
        System.err.println(error.getMessage() + "\n[line " + error.token.line + "]");
        hadRuntimeError = true;
    }

    // entry point
    /* public static void main(String[] args) throws IOException{
        if (args.length > 1) {  // no more than one file could be scanned
            System.out.println("Usage: jlox [script]");
            System.exit(64);  // 64?
        } else if (args.length == 1){
            runFile(args[0]);   // hello.lox passed as argument for runFile() for scanning
        } else {
            runPrompt();        // without any arguments
        }
    } */
}

import { readFileSync } from 'fs'
import Token from './Tokens/Token';
import { TokenType } from './Tokens/TokenType';
import Lexer from './Lexer/Lexer'
import Parser from './Parser/Parser';
import ProgramAST from './AST/MainAST/ProgramAST';

export default class Interpreter {

    private lexProgram(programBuffer: string): Token[] {
        const lexer: Lexer = new Lexer();
        const tokenQueue: Token[] = lexer.scanProgram(programBuffer);
        
        tokenQueue.push(new Token(
            'ε', TokenType.Token_Epsilon, -1
        ));

        return tokenQueue;
    }

    private parseProgram(tokenQueue: Token[]) {
        const parser: Parser = new Parser(tokenQueue);
        const AST: ProgramAST = parser.parseProgram();

        console.log(AST);
    }

    runProgram(programFile: string) {
        const programBuffer: string = readFileSync(programFile, 'utf-8').toString();
        const tokenQueue: Token[] = this.lexProgram(programBuffer);
        
        this.parseProgram(tokenQueue);
    }
}
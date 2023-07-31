import ProgramAST from "../AST/ProgramAST";
import FuncDeclAST from "../AST/FuncDeclAST";
import BlockAST from "../AST/BlockAST";
import VarDeclAST from "../AST/VarDeclAST";
import ParameterAST from "../AST/ParameterAST";
import StmtAST from "../AST/StmtAST/StmtAST";

import Symbol from "./SymbolTable/Symbol/Symbol";
import SymbolFunction from "./SymbolTable/Symbol/SymbolFunction";
import SymbolTable from "./SymbolTable/SymbolTable";
import SymbolArray from "./SymbolTable/Symbol/SymbolArray";
import { SymbolType } from "./SymbolTable/Symbol/SymbolType";
import symbolVisitorInterface from "./symbolVisitorInterface";

import { DecafType } from "../AST/DecafType";
import { NodeType } from "../AST/NodeType";
import WhileLoopStmtAST from "../AST/StmtAST/WhileLoopStmtAST";
import ConditionalStmtAST from "../AST/StmtAST/ConditionalStmtAST";

export default class SymbolVisitor implements symbolVisitorInterface {

    private symbolTableStack: SymbolTable[] = [];

    buildSymbolTables(programAST: ProgramAST) {
        this.visitProgram(programAST);
    }

    private initializeIOIntoGlobalScope(globalScopeSymbolTable: SymbolTable) {
        const printStrSymbol: SymbolFunction = new SymbolFunction(
            SymbolType.FUNCTION_SYMBOL,
            "print_str",
            DecafType.VOID,
            [new ParameterAST(
                NodeType.PARAMETER,
                -1,
                "print_str_parameter",
                DecafType.STR
            )]
        );

        const printIntSymbol: SymbolFunction = new SymbolFunction(
            SymbolType.FUNCTION_SYMBOL,
            "print_int",
            DecafType.VOID,
            [new ParameterAST(
                NodeType.PARAMETER,
                -1,
                "print_int_parameter",
                DecafType.INT
            )]
        );

        const printBoolSymbol: SymbolFunction = new SymbolFunction(
            SymbolType.FUNCTION_SYMBOL,
            "print_bool",
            DecafType.VOID,
            [new ParameterAST(
                NodeType.PARAMETER,
                -1,
                "print_bool_parameter",
                DecafType.BOOL
            )]
        );

        globalScopeSymbolTable.addSymbol(printStrSymbol);
        globalScopeSymbolTable.addSymbol(printIntSymbol);
        globalScopeSymbolTable.addSymbol(printBoolSymbol);
    }

    visitProgram(programAST: ProgramAST) { 
        const globalScopeSymbolTable: SymbolTable = new SymbolTable(programAST.type);
        this.initializeIOIntoGlobalScope(globalScopeSymbolTable);

        this.symbolTableStack.push(globalScopeSymbolTable);

        programAST.variables.forEach((variableAST: VarDeclAST) => {
            variableAST.acceptSymbolElement(this);
        })

        programAST.functions.forEach((functionDeclAST: FuncDeclAST) => {
            functionDeclAST.acceptSymbolElement(this);
        })

        programAST.addSymbolTable(globalScopeSymbolTable);
        this.symbolTableStack.pop();
    }

    visitFuncDecl(funcDeclAST: FuncDeclAST) {
        const functionNameSymbol: SymbolFunction = new SymbolFunction(
            SymbolType.FUNCTION_SYMBOL,
            funcDeclAST.name,
            funcDeclAST.returnType,
            funcDeclAST.parameters
        );
        this.symbolTableStack[this.symbolTableStack.length-1]
            .addSymbol(functionNameSymbol);

        const functionDeclScopeSymbolTable: SymbolTable = new SymbolTable(
            funcDeclAST.type, this.symbolTableStack[this.symbolTableStack.length-1]
        );
        this.symbolTableStack.push(functionDeclScopeSymbolTable);

        funcDeclAST.parameters.forEach((parameter: ParameterAST) => {
            parameter.acceptSymbolElement(this);
        })
        funcDeclAST.body.acceptSymbolElement(this);
        
        funcDeclAST.addSymbolTable(functionDeclScopeSymbolTable);
        this.symbolTableStack.pop();
    }

    visitBlock(blockAST: BlockAST) {
        const blockScopeSymbolTable: SymbolTable = new SymbolTable(
            NodeType.BLOCK, this.symbolTableStack[this.symbolTableStack.length-1]
        );

        this.symbolTableStack.push(blockScopeSymbolTable);

        blockAST.variables.forEach((variableAST: VarDeclAST) => {
            variableAST.acceptSymbolElement(this);
        }) 

        blockAST.statements.forEach((stmtAST: StmtAST) => {
            if (stmtAST.type === NodeType.CONDITIONAL) {
                const conditionStmt: ConditionalStmtAST = stmtAST as ConditionalStmtAST;
                conditionStmt.ifBlock.acceptSymbolElement(this);

                if (conditionStmt.elseBlock) {
                    conditionStmt.elseBlock.acceptSymbolElement(this);
                }
            }
            else if (stmtAST.type === NodeType.WHILELOOP) {
                const whileLoopStmt: WhileLoopStmtAST = stmtAST as WhileLoopStmtAST;
                whileLoopStmt.body.acceptSymbolElement(this);
            }
        })

        blockAST.addSymbolTable(blockScopeSymbolTable);
        this.symbolTableStack.pop();
    }

    visitVarDec(varDeclAST: VarDeclAST) {
        if (varDeclAST.isArray) {
            const newSymbolArray: SymbolArray = new SymbolArray(
                SymbolType.ARRAY_SYMBOL,
                varDeclAST.name,
                varDeclAST.decafType,
                varDeclAST.arrayLength
            );

            this.symbolTableStack[this.symbolTableStack.length-1]
                .addSymbol(newSymbolArray);
        }

        else {
            const newSymbolScalar: Symbol = new Symbol(
                SymbolType.SCALAR_SYMBOL,
                varDeclAST.name,
                varDeclAST.decafType
            );
            this.symbolTableStack[this.symbolTableStack.length-1]
                .addSymbol(newSymbolScalar);
        }
    }

    visitParameter(parameterAST: ParameterAST) {
        const parameterSymbol: Symbol = new Symbol(
            SymbolType.SCALAR_SYMBOL,
            parameterAST.name,
            parameterAST.parameterType
        );

        this.symbolTableStack[this.symbolTableStack.length-1]
            .addSymbol(parameterSymbol);
    }
}
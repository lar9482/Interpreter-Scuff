import ExprAST from "../ExprAST/ExprAST";
import { NodeType } from "../NodeType";
import StmtAST from "./StmtAST";
import BlockAST from "../BlockAST";

export default class ConditionalStmtAST extends StmtAST {

    condition: ExprAST;
    ifBlock: BlockAST;
    elseBlock: BlockAST | undefined;

    constructor(type: NodeType, sourceLineNumber: number,
        condition: ExprAST,
        ifBlock: BlockAST,
        elseBlock: BlockAST | undefined) {
            
        super(type, sourceLineNumber);

        this.condition = condition;
        this.ifBlock = ifBlock;
        this.elseBlock = elseBlock;
    }
}
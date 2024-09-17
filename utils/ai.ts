import { Chess } from 'chess.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function getGeminiResponse(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "You are an expert chess AI, analyze chess position and suggest the best move.",
    generationConfig: {
      maxOutputTokens: 200
    }
  });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function getGeminiMove(fen: string,newMoves:string[]): Promise<string> {
  const chess = new Chess(fen);
  const legalMoves = chess.moves();


  try {
    const prompt = `
    As an expert chess AI, analyze this chess position and suggest the best move.
    Current position (FEN): ${fen}
    Total moves till now: ${JSON.stringify(newMoves)}
    Legal moves:${JSON.stringify(legalMoves)}
    Your color is black or b, game starts from white.
    Donot write any extra explanation, respond in that json format that can be parsed easily.
    Provide your response in the following JSON format:{"move": "e2e4","explanation": "Brief explanation of why this is the best move"}`;
  
    const aiResponse = await getGeminiResponse(prompt);
    const regex = /^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/;
    const result = aiResponse.replace(regex, '$1');
    const parsedResponse = JSON.parse(result.trim());
    console.log(parsedResponse)
    return parsedResponse.move;
  } catch (error) {
    console.error("Error getting move from Gemini AI:", error);
    throw error;
  }
}

function evaluateBoard(board: Chess): number {
  const pieceValues = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
    P: -1, N: -3, B: -3, R: -5, Q: -9, K: 0,
  };

  let score = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board.get(String.fromCharCode(97 + j) + (8 - i));
      if (piece) {
        score += pieceValues[piece.type];
      }
    }
  }
  return score;
}

function minimax(board: Chess, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {
  if (depth === 0 || board.isGameOver()) {
    return evaluateBoard(board);
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of board.moves()) {
      board.move(move);
      const evaluation = minimax(board, depth - 1, alpha, beta, false);
      board.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of board.moves()) {
      board.move(move);
      const evaluation = minimax(board, depth - 1, alpha, beta, true);
      board.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
}

function getMinimaxMove(fen: string): string {
  const chess = new Chess(fen);
  let bestMove = null;
  let bestEval = -Infinity;

  for (const move of chess.moves()) {
    chess.move(move);
    const evaluation = minimax(chess, 3, -Infinity, Infinity, false);
    chess.undo();

    if (evaluation > bestEval) {
      bestEval = evaluation;
      bestMove = move;
    }
  }

  return bestMove || chess.moves()[0];
}

export async function makeAIMove(fen: string,newMoves:string[]): Promise<string> {
  const chess = new Chess(fen);
  
  if (chess.isGameOver()) {
    throw new Error("The game is already over.");
  }

  try {
    // Try to get a move from Gemini AI
    const geminiMove = await getGeminiMove(fen,newMoves);
    
    // Verify the move is legal
    if (chess.moves().includes(geminiMove)) {
      console.log("Using Gemini AI move:", geminiMove);
      return geminiMove;
    }

    // If Gemini suggested an illegal move, fall back to minimax
    console.warn("Gemini suggested an illegal move. Falling back to minimax.");
    const minimaxMove = getMinimaxMove(fen);
    console.log("Using Minimax move:", minimaxMove);
    return minimaxMove;
  } catch (error) {
    console.error("Error with Gemini AI, falling back to minimax:", error);
    const minimaxMove = getMinimaxMove(fen);
    console.log("Using Minimax move:", minimaxMove);
    return minimaxMove;
  }
}
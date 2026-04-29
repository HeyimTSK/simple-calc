import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Op = "+" | "-" | "*" | "/";

const compute = (a: number, b: number, op: Op): number => {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? 0 : a / b;
  }
};

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [waiting, setWaiting] = useState(false);

  const inputDigit = useCallback((d: string) => {
    setDisplay((cur) => {
      if (waiting) {
        setWaiting(false);
        return d;
      }
      if (cur === "0") return d;
      return cur + d;
    });
  }, [waiting]);

  const inputDot = useCallback(() => {
    setDisplay((cur) => {
      if (waiting) {
        setWaiting(false);
        return "0.";
      }
      return cur.includes(".") ? cur : cur + ".";
    });
  }, [waiting]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setWaiting(false);
  }, []);

  const applyOp = useCallback((next: Op) => {
    const value = parseFloat(display);
    if (prev !== null && op && !waiting) {
      const result = compute(prev, value, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(value);
    }
    setOp(next);
    setWaiting(true);
  }, [display, prev, op, waiting]);

  const equals = useCallback(() => {
    const value = parseFloat(display);
    if (prev !== null && op) {
      const result = compute(prev, value, op);
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setWaiting(true);
    }
  }, [display, prev, op]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (/^[0-9]$/.test(e.key)) inputDigit(e.key);
    else if (e.key === ".") inputDot();
    else if (["+", "-", "*", "/"].includes(e.key)) applyOp(e.key as Op);
    else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
    else if (e.key === "Escape") clear();
    else if (e.key === "Backspace") {
      setDisplay((cur) => (cur.length <= 1 ? "0" : cur.slice(0, -1)));
    }
  }, [inputDigit, inputDot, applyOp, equals, clear]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const Btn = ({
    onClick,
    children,
    variant = "default",
    className,
  }: {
    onClick: () => void;
    children: React.ReactNode;
    variant?: "default" | "operator" | "accent";
    className?: string;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "h-16 rounded-2xl text-xl font-semibold transition-smooth active:scale-95",
        variant === "default" && "bg-secondary text-secondary-foreground hover:bg-muted",
        variant === "operator" && "bg-primary-soft text-primary hover:bg-primary/15",
        variant === "accent" && "bg-primary text-primary-foreground hover:opacity-90 shadow-elegant",
        className,
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-elegant">
      <h1 className="text-sm font-medium text-muted-foreground mb-2">Calculator</h1>
      <div className="rounded-2xl bg-muted/50 p-5 mb-5 text-right">
        <div className="text-4xl font-semibold tracking-tight break-all">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Btn onClick={clear} variant="operator" className="col-span-2">AC</Btn>
        <Btn onClick={() => applyOp("/")} variant="operator">÷</Btn>
        <Btn onClick={() => applyOp("*")} variant="operator">×</Btn>

        <Btn onClick={() => inputDigit("7")}>7</Btn>
        <Btn onClick={() => inputDigit("8")}>8</Btn>
        <Btn onClick={() => inputDigit("9")}>9</Btn>
        <Btn onClick={() => applyOp("-")} variant="operator">−</Btn>

        <Btn onClick={() => inputDigit("4")}>4</Btn>
        <Btn onClick={() => inputDigit("5")}>5</Btn>
        <Btn onClick={() => inputDigit("6")}>6</Btn>
        <Btn onClick={() => applyOp("+")} variant="operator">+</Btn>

        <Btn onClick={() => inputDigit("1")}>1</Btn>
        <Btn onClick={() => inputDigit("2")}>2</Btn>
        <Btn onClick={() => inputDigit("3")}>3</Btn>
        <Btn onClick={equals} variant="accent" className="row-span-2 h-auto">=</Btn>

        <Btn onClick={() => inputDigit("0")} className="col-span-2">0</Btn>
        <Btn onClick={inputDot}>.</Btn>
      </div>
    </div>
  );
};

export default Calculator;
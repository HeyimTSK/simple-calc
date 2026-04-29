import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type Op = "+" | "−" | "×" | "÷";

const compute = (a: number, b: number, op: Op): number => {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
  }
};

const formatDisplay = (value: string) => {
  if (value === "Error") return value;
  const [intPart, decPart] = value.split(".");
  const isNeg = intPart.startsWith("-");
  const digits = isNeg ? intPart.slice(1) : intPart;
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (isNeg ? "-" : "") + withCommas + (decPart !== undefined ? "." + decPart : "");
};

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [waiting, setWaiting] = useState(false);

  const clearAll = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setWaiting(false);
  };

  const inputDigit = (d: string) => {
    if (display === "Error") clearAll();
    if (waiting) {
      setDisplay(d);
      setWaiting(false);
    } else {
      setDisplay(display === "0" ? d : display + d);
    }
  };

  const inputDot = () => {
    if (display === "Error") clearAll();
    if (waiting) {
      setDisplay("0.");
      setWaiting(false);
      return;
    }
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const toggleSign = () => {
    if (display === "0" || display === "Error") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  };

  const percent = () => {
    if (display === "Error") return;
    const v = parseFloat(display) / 100;
    setDisplay(String(v));
  };

  const performOp = (next: Op) => {
    if (display === "Error") return;
    const current = parseFloat(display);
    if (prev !== null && op && !waiting) {
      const result = compute(prev, current, op);
      if (Number.isNaN(result) || !Number.isFinite(result)) {
        setDisplay("Error");
        setPrev(null);
        setOp(null);
        setWaiting(false);
        return;
      }
      setPrev(result);
      setDisplay(String(result));
    } else {
      setPrev(current);
    }
    setOp(next);
    setWaiting(true);
  };

  const equals = () => {
    if (display === "Error" || prev === null || op === null) return;
    const current = parseFloat(display);
    const result = compute(prev, current, op);
    if (Number.isNaN(result) || !Number.isFinite(result)) {
      setDisplay("Error");
    } else {
      setDisplay(String(result));
    }
    setPrev(null);
    setOp(null);
    setWaiting(true);
  };

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (/^[0-9]$/.test(e.key)) inputDigit(e.key);
    else if (e.key === ".") inputDot();
    else if (e.key === "+") performOp("+");
    else if (e.key === "-") performOp("−");
    else if (e.key === "*") performOp("×");
    else if (e.key === "/") { e.preventDefault(); performOp("÷"); }
    else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
    else if (e.key === "Escape") clearAll();
    else if (e.key === "%") percent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, prev, op, waiting]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const Btn = ({
    children,
    onClick,
    variant = "key",
    span = false,
    ariaLabel,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: "key" | "muted" | "operator" | "active";
    span?: boolean;
    ariaLabel?: string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ boxShadow: "var(--shadow-key)" }}
      className={cn(
        "h-16 rounded-2xl text-2xl font-medium transition-all duration-200",
        "active:scale-95 hover:brightness-110",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        span && "col-span-2",
        variant === "key" && "bg-key text-key-foreground",
        variant === "muted" && "bg-key-muted text-key-muted-foreground",
        variant === "operator" && "bg-operator text-operator-foreground font-semibold",
        variant === "active" && "bg-foreground text-background font-semibold",
      )}
    >
      {children}
    </button>
  );

  const opBtn = (target: Op) =>
    op === target && waiting ? "active" : "operator";

  return (
    <div
      className="rounded-3xl bg-card/80 backdrop-blur-xl border border-border p-5 shadow-elegant"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      <div
        className="mb-5 rounded-2xl bg-background/40 px-5 py-7 text-right overflow-hidden"
        aria-live="polite"
      >
        <div className="text-xs uppercase tracking-widest text-muted-foreground h-4">
          {prev !== null && op ? `${formatDisplay(String(prev))} ${op}` : "\u00A0"}
        </div>
        <div
          className="font-mono font-medium text-foreground truncate"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: display.length > 9 ? "2.25rem" : "3rem",
            lineHeight: 1.1,
          }}
        >
          {formatDisplay(display)}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Btn variant="muted" onClick={clearAll} ariaLabel="Clear">AC</Btn>
        <Btn variant="muted" onClick={toggleSign} ariaLabel="Toggle sign">+/−</Btn>
        <Btn variant="muted" onClick={percent} ariaLabel="Percent">%</Btn>
        <Btn variant={opBtn("÷")} onClick={() => performOp("÷")} ariaLabel="Divide">÷</Btn>

        <Btn onClick={() => inputDigit("7")}>7</Btn>
        <Btn onClick={() => inputDigit("8")}>8</Btn>
        <Btn onClick={() => inputDigit("9")}>9</Btn>
        <Btn variant={opBtn("×")} onClick={() => performOp("×")} ariaLabel="Multiply">×</Btn>

        <Btn onClick={() => inputDigit("4")}>4</Btn>
        <Btn onClick={() => inputDigit("5")}>5</Btn>
        <Btn onClick={() => inputDigit("6")}>6</Btn>
        <Btn variant={opBtn("−")} onClick={() => performOp("−")} ariaLabel="Subtract">−</Btn>

        <Btn onClick={() => inputDigit("1")}>1</Btn>
        <Btn onClick={() => inputDigit("2")}>2</Btn>
        <Btn onClick={() => inputDigit("3")}>3</Btn>
        <Btn variant={opBtn("+")} onClick={() => performOp("+")} ariaLabel="Add">+</Btn>

        <Btn span onClick={() => inputDigit("0")}>0</Btn>
        <Btn onClick={inputDot}>.</Btn>
        <Btn variant="operator" onClick={equals} ariaLabel="Equals">=</Btn>
      </div>
    </div>
  );
};

export default Calculator;
import Calculator from "@/components/Calculator";

const Index = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Calc
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A simple, beautiful calculator
          </p>
        </header>
        <Calculator />
      </div>
    </main>
  );
};

export default Index;

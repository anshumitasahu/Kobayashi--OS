import { useRef, useState } from "react";
import { Sandbox } from "e2b";

export default function Terminal() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sandboxRef = useRef(null);

  const apiKey = import.meta.env.VITE_E2B_API_KEY;

  async function getSandbox() {
    if (!sandboxRef.current) {
      sandboxRef.current = await Sandbox.create("base", {
        apiKey,
      });
    }

    return sandboxRef.current;
  }

  async function runCommand() {
    const command = input.trim();

    if (!command || loading) return;

    if (command === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    if (command === "whoami") {
      setHistory((prev) => [
        ...prev,
        {
          type: "output",
          value: "Riko (Anshumita Sahu)- The developer"
        }
      ])
    }

    setHistory((prev) => [
      ...prev,
      {
        type: "input",
        value: command,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const sandbox = await getSandbox();

      const result = await sandbox.commands.run(command);

      if (result.stdout) {
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            value: result.stdout,
          },
        ]);
      }

      if (result.stderr) {
        setHistory((prev) => [
          ...prev,
          {
            type: "error",
            value: result.stderr,
          },
        ]);
      }
    } catch (error) {
      console.error(error);

      setHistory((prev) => [
        ...prev,
        {
          type: "error",
          value:
            error instanceof Error
              ? error.message
              : String(error),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleEnter(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand();
    }
  }

  return (
    <div className="bg-[#1e1e1e] w-full h-full rounded-lg p-4 text-white font-mono flex flex-col">
      <div className="overflow-y-auto">
        {history.map((item, index) => (
          <div key={index}>
            {item.type === "input" ? (
              <div>
                <span className="text-green-400">$ </span>
                <span>{item.value}</span>
              </div>
            ) : (
              <pre
                className={
                  item.type === "error"
                    ? "text-red-400"
                    : "text-gray-200"
                }
              >
                {item.value}
              </pre>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-gray-500">
            Running...
          </div>
        )}
      </div>

      <div className="flex items-center">
        <span className="text-green-400">$ </span>

        <input
          autoFocus
          value={input}
          disabled={loading}
          placeholder="Enter your command..."
          className=" bg-transparent outline-none ml-2"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleEnter}
        />
      </div>
    </div>
  );
}

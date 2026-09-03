import { Sandbox } from "e2b";

export default function Terminal() {
  async function runCommand() {
    const sandbox = await Sandbox.create("base", {
      apiKey: "YOUR_E2B_API_KEY",
    });

    const result = await sandbox.commands.run(
      'echo "Hello from E2B"'
    );

    console.log(result.stdout);
  }

  return (
    <div className="bg-[#1e1e1e] w-full h-full rounded-lg p-4 text-white font-mono flex flex-col">
      <button onClick={runCommand}>
        Run The Command
      </button>
    </div>
  );
}
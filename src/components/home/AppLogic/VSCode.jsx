import { Editor } from "@monaco-editor/react";

export default function VS_Code() {
    return (
        <div className="bg-[#1e1e1e] w-full h-full rounded-lg">
            <Editor
                theme="vs-dark"
                height="100%"
                defaultLanguage="javascript"
                defaultValue="// your code here.."
                options={{
                    automaticLayout: true,
                    minimap: {
                        enabled: false,
                    },
                    fontSize: 14,
                    tabSize: 2,
                    wordWrap: "on",
                }}
            />
        </div>
    );
}

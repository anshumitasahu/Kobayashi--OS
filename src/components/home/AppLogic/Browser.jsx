export default function Browser({ searchQuery = "" }) {
    const url = searchQuery
        ? `https://www.google.com/search?igu=1&q=${encodeURIComponent(searchQuery)}`
        : "https://www.google.com/search?igu=1";

    return (
        <div className="w-full h-full">
            <iframe
                src={url}
                title="Browser"
                className="h-full w-full rounded-md"
            />
        </div>
    );
}
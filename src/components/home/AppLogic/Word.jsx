import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Essentials, Paragraph, Bold, Italic, Underline, Strikethrough, Font, Heading, Link, List, Alignment, BlockQuote, Table, TableToolbar, Image, ImageToolbar, ImageUpload, MediaEmbed, Indent, CodeBlock, HorizontalLine, PageBreak, FindAndReplace, WordCount } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

export default function Word() {
    return (
        <div className="w-full h-full bg-white">
            <CKEditor
                editor={ClassicEditor}
                config={{
                    licenseKey: 'GPL',
                    plugins: [
                        Essentials, Paragraph, Bold, Italic, Underline, Strikethrough, Font, Heading, Link, List, Alignment, BlockQuote, Table, TableToolbar, Image, ImageToolbar, ImageUpload, MediaEmbed, Indent, CodeBlock, HorizontalLine, PageBreak, FindAndReplace, WordCount
                    ],
                    toolbar: [
                        'undo', 'redo', '|', 'heading', '|', 'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'alignment', '|', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'link', 'insertImage', 'mediaEmbed', '|', 'insertTable', 'blockQuote', 'codeBlock', '|', 'horizontalLine', 'pageBreak', '|', 'findAndReplace'
                    ],
                    table: {
                        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
                    },
                    fontFamily: {
                        options: [
                            'default',
                            'Arial, Helvetica, sans-serif',
                            'Georgia, serif',
                            'Times New Roman, Times, serif',
                            'Verdana, sans-serif'
                        ]
                    },
                    fontSize: {
                        options: [10, 12, 14, 16, 18, 20, 24, 28, 32]
                    }
                }}
            />
        </div>
    );
};

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css';

// Register custom fonts with Quill
if (typeof window !== 'undefined') {
  const Quill = require('react-quill').Quill;
  const Font = Quill.import('formats/font');
  Font.whitelist = ['poppins', 'helvetica', 'roboto', 'georgia', 'arial', 'courier'];
  Quill.register(Font, true);
}

const InputEditor = (props: any) => {
  const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }), []);
  return (
    <ReactQuill
      {...props}
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    />
  );
};

export default InputEditor;

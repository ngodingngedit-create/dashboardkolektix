import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css';

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

import React from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

function decodeIds(svg: string) {
  svg = svg.replace(/class="([^"]+)"/g, (match, p1: string) => {
    if (p1.includes('MO__')) {
      return `data-object="${p1.replace('MO__', '')}"`;
    } else {
      return '';
    }
  });
  svg = svg.replace(/&#(\d+);/g, function (match, p1: string) {
    return String.fromCharCode(parseInt(p1));
  });
  svg = svg.replace(/data-object="([^"]+)"/g, function (match, p1: string) {
    // Фикс кириллицы
    const decodedStr = decodeURIComponent(escape(p1));
    return 'data-object="' + decodedStr + '"';
  });

  return svg;
}

const EncodeMapObjectsSection = () => {
  const [text, setText] = React.useState('');

  return (
    <div className="flex flex-col items-center space-y-4">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} />
      <Button
        className="w-full"
        onClick={() => {
          setText(decodeIds(text));
        }}
      >
        Закодировать
      </Button>
    </div>
  );
};

export default EncodeMapObjectsSection;

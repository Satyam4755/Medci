const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
}

const files = walkSync('./src').filter(f => f.endsWith('.jsx') || f.endsWith('.css'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Background gradients
  content = content.replace(/bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/g, 'bg-black');
  
  // Replace from/via/to slate
  content = content.replace(/from-slate-900/g, 'from-black');
  content = content.replace(/via-slate-800/g, 'via-neutral-900');
  content = content.replace(/to-slate-900/g, 'to-black');

  // Colors slate -> neutral/black
  content = content.replace(/slate-900/g, 'black');
  content = content.replace(/slate-800/g, 'neutral-900');
  content = content.replace(/slate-700/g, 'neutral-800');
  content = content.replace(/slate-600/g, 'neutral-700');
  content = content.replace(/slate-500/g, 'neutral-500');
  content = content.replace(/slate-400/g, 'neutral-400');
  content = content.replace(/slate-300/g, 'neutral-300');
  
  // Blue -> white/black equivalents
  content = content.replace(/blue-400/g, 'white');
  content = content.replace(/blue-500/g, 'white');
  content = content.replace(/blue-600/g, 'white');
  content = content.replace(/blue-700/g, 'neutral-200');
  content = content.replace(/shadow-blue-600\/30/g, 'shadow-[0_0_20px_rgba(255,255,255,0.1)]');
  
  // Emerald
  content = content.replace(/emerald-400/g, 'white');
  content = content.replace(/emerald-500/g, 'white');
  content = content.replace(/emerald-600/g, 'white');
  content = content.replace(/emerald-700/g, 'neutral-200');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});

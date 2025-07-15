import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { 
  FileText, 
  Settings, 
  Package, 
  Container,
  AlertCircle,
  RotateCcw,
  ArrowRight
} from "lucide-react";

const FILES = [
  {
    name: "devcontainer.json",
    content: `{
  "name": "My Dev Container",
  "dockerFile": "Dockerfile",
  "settings": {
    "terminal.integrated.shell.linux": "/bin/bash"
  },
  "extensions": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}`,
    type: "json"
  },
  {
    name: "pm2.config.js",
    content: `module.exports = {
  apps: [
    {
      name: "app",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};`,
    type: "javascript"
  },
  {
    name: "docker-compose.yml",
    content: `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development`,
    type: "yaml"
  },
  {
    name: "Dockerfile",
    content: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]`,
    type: "dockerfile"
  }
];

const getFileIcon = (type) => {
  switch (type) {
    case "json":
      return <Settings className="w-3 h-3" />;
    case "javascript":
      return <FileText className="w-3 h-3" />;
    case "yaml":
      return <Package className="w-3 h-3" />;
    case "dockerfile":
      return <Container className="w-3 h-3" />;
    default:
      return <FileText className="w-3 h-3" />;
  }
};

const getFileStats = (content) => {
  const lines = content.split('\n').length;
  const chars = content.length;
  const bytes = new Blob([content]).size;
  return { lines, chars, bytes };
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function ReviewPoolEnvironmentStep({ 
  onConfirm, 
  onBack 
}) {
  const [activeFile, setActiveFile] = useState(FILES[0].name);
  const [fileContents, setFileContents] = useState(
    Object.fromEntries(FILES.map(f => [f.name, f.content]))
  );
  const [originalContents] = useState(
    Object.fromEntries(FILES.map(f => [f.name, f.content]))
  );
  const [errors, setErrors] = useState({});

  const validateFile = useCallback((fileName, content) => {
    const file = FILES.find(f => f.name === fileName);
    if (!file) return;
    try {
      if (file.type === "json") {
        JSON.parse(content);
      }
      setErrors(prev => ({ ...prev, [fileName]: '' }));
    } catch (e) {
      setErrors(prev => ({ 
        ...prev, 
        [fileName]: file.type === "json" ? "Invalid JSON format" : "Invalid file format" 
      }));
    }
  }, []);

  const handleContentChange = (fileName, value) => {
    setFileContents(prev => ({ ...prev, [fileName]: value }));
    validateFile(fileName, value);
  };

  const isFileModified = (fileName) => fileContents[fileName] !== originalContents[fileName];
  const hasErrors = Object.values(errors).some(error => error !== '');
  const resetFiles = () => {
    setFileContents(originalContents);
    setErrors({});
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = FILES.findIndex(f => f.name === activeFile);
        const nextIndex = (currentIndex + 1) % FILES.length;
        setActiveFile(FILES[nextIndex].name);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile]);

  useEffect(() => {
    FILES.forEach(file => validateFile(file.name, fileContents[file.name]));
  }, [validateFile, fileContents]);

  const currentFileStats = getFileStats(fileContents[activeFile]);

  return (
    <Card className="max-w-4xl mx-auto bg-card text-card-foreground">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mx-auto mb-4">
          {/* Animated SVG omitted for brevity */}
        </div>
        <CardTitle className="text-2xl">Review Pool Environment</CardTitle>
        <CardDescription>
          Review and edit your environment files. Switch between files, make changes if needed, and confirm when ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeFile} onValueChange={setActiveFile} className="w-full">
          <div className="mb-4 overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
              {FILES.map(file => (
                <TabsTrigger 
                  key={file.name} 
                  value={file.name} 
                  className={`font-mono text-xs flex items-center gap-2 relative ${
                    isFileModified(file.name) ? 'text-orange-600' : ''
                  }`}
                >
                  {getFileIcon(file.type)}
                  <span className="hidden sm:inline">{file.name}</span>
                  <span className="sm:hidden">{file.name.split('.')[0]}</span>
                  {isFileModified(file.name) && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                  {errors[file.name] && (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {FILES.map(file => (
            <TabsContent key={file.name} value={file.name} className="w-full space-y-4">
              {/* File Stats */}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {currentFileStats.lines} lines
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentFileStats.chars} chars
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formatBytes(currentFileStats.bytes)}
                </Badge>
                {isFileModified(file.name) && (
                  <Badge variant="outline" className="text-xs text-orange-600">
                    Modified
                  </Badge>
                )}
              </div>

              {/* Code Editor */}
              <div className="relative">
                <Textarea
                  className={`font-mono text-xs min-h-[300px] sm:min-h-[400px] resize-vertical ${
                    errors[file.name] ? 'border-red-500' : ''
                  }`}
                  value={fileContents[file.name]}
                  onChange={e => handleContentChange(file.name, e.target.value)}
                  spellCheck={false}
                  placeholder="Enter your code here..."
                  style={{
                    tabSize: 2,
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                  }}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={resetFiles}
              disabled={!FILES.some(f => isFileModified(f.name))}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </Button>
            <Button 
              className="px-8 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onConfirm}
              disabled={hasErrors}
            >
              Confirm & Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

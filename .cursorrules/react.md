# React Development Rules

## Component Structure
- Use functional components with hooks
- Define props interface at the top of the component
- Use destructuring for props
- Keep components focused and single-purpose
- Use proper TypeScript types for all props

## State Management
- Use useState for local component state
- Use useReducer for complex state logic
- Prefer custom hooks for reusable state logic
- Use context sparingly and only for truly global state
- Consider Zustand or similar for complex state management

## Hooks Guidelines
- Always call hooks at the top level of components
- Don't call hooks inside loops, conditions, or nested functions
- Use custom hooks to extract reusable logic
- Follow the naming convention: use[Description]
- Include proper dependencies in useEffect

## Event Handling
- Use camelCase for event handler names
- Handle events with proper TypeScript types
- Prevent default behavior when necessary
- Use proper event delegation when appropriate

## Conditional Rendering
- Use ternary operators for simple conditions
- Use logical AND (&&) for conditional rendering
- Extract complex conditional logic into variables
- Use early returns for guard clauses

## Example Component Structure:
```tsx
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export const Component = ({ title, onAction }: ComponentProps) => {
  const [state, setState] = useState<StateType>(initialState);
  
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  const handleClick = () => {
    // Event handler logic
  };
  
  if (condition) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  );
};
``` 
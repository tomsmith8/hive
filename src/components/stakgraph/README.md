# Stakgraph Components

This directory contains the modular, reusable form components for Stakgraph configuration.

## Architecture

The Stakgraph configuration form has been broken down into logical, reusable components:

### Form Components

- **`ProjectInfoForm`** - Name and description fields
- **`RepositoryForm`** - Repository URL configuration
- **`SwarmForm`** - Swarm URL and API key configuration
- **`EnvironmentForm`** - Pool name and environment variables
- **`ServicesForm`** - Services configuration with scripts

### Shared Types

All components share common types defined in `types.ts`:

- `StakgraphSettings` - Complete form data structure
- `FormSectionProps<T>` - Common props interface for form sections
- Individual data interfaces for each form section

### Usage

```tsx
import {
  ProjectInfoForm,
  RepositoryForm,
  SwarmForm,
  EnvironmentForm,
  ServicesForm
} from '@/components/stakgraph';

// Use in a form with proper spacing
<div className="space-y-6">
  <ProjectInfoForm
    data={{ name: "...", description: "..." }}
    errors={errors}
    loading={loading}
    onChange={handleProjectInfoChange}
  />
  <RepositoryForm
    data={{ repositoryUrl: "..." }}
    errors={errors}
    loading={loading}
    onChange={handleRepositoryChange}
  />
  {/* ... other form sections */}
</div>
```

### Benefits

1. **Reusable** - Individual form sections can be used in different contexts (e.g., onboarding flows)
2. **Maintainable** - Each component has a single responsibility
3. **Testable** - Components can be tested in isolation
4. **Consistent** - Shared types ensure consistency across components

### Files Structure

```
stakgraph/
├── README.md           # This file
├── index.ts           # Barrel exports
├── types.ts           # Shared TypeScript types
└── forms/
    ├── ProjectInfoForm.tsx
    ├── RepositoryForm.tsx
    ├── SwarmForm.tsx
    ├── EnvironmentForm.tsx
    └── ServicesForm.tsx
``` 
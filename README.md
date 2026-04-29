# RecipesProject API

## Roles
- `guest` - not authenticated
- `registered` - authenticated regular user
- `admin` - authenticated administrator

## API Table
| Method | URL | Role | Description |
|---|---|---|---|
| POST | `/api/users/register` | guest | Register new user |
| POST | `/api/users/login` | guest | Login and get JWT token |
| GET | `/api/users` | admin | Get all users |
| PATCH | `/api/users/:id/password` | self/admin | Update user password |
| DELETE | `/api/users/:id` | admin | Delete user |
| GET | `/api/recipes?search=&limit=&page=` | guest/registered/admin | Get recipes with text search and paging |
| GET | `/api/recipes/:code` | guest/registered/admin | Get recipe by recipe code |
| GET | `/api/recipes/by-preparation-time?maxMinutes=30` | guest/registered/admin | Get recipes up to max preparation time |
| POST | `/api/recipes` | registered/admin | Add recipe |
| PUT | `/api/recipes/:id` | recipe owner/admin* | Update recipe |
| DELETE | `/api/recipes/:id` | recipe owner/admin* | Delete recipe |
| GET | `/api/categories` | guest/registered/admin | Get all categories |
| GET | `/api/categories/with-recipes` | guest/registered/admin | Get all categories with recipes |
| GET | `/api/categories/lookup/:value` | guest/registered/admin | Get category by code/name with recipes |

\* Route role allows authenticated users; controller enforces ownership.

## Notes
- Error format is normalized to: `{ "error": { "message": "..." } }`
- Unknown routes return `404` in the same error format.
- JWT authentication uses `Authorization: Bearer <token>`.
- CORS is currently open to all origins.

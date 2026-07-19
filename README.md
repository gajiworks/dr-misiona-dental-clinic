# BrightSmile Dental Care Website

A responsive family dental clinic website for BrightSmile Dental Care in San Jose del Monte, Bulacan.

## Project structure

- `DentalWorks/` contains the Blazor website.
- `docs/` contains the matching standalone GitHub Pages site.
- `DentalWorks/Components/Pages/Home.razor` contains the main page content.
- `DentalWorks/wwwroot/app.css` and `docs/site.css` contain the responsive styles.

The current design intentionally uses labeled media placeholders. No real or externally hosted clinic images are shown.

## Appointment form

The frontend-only form submits to StaticForms. Source files retain the placeholder `__STATIC_FORMS_API_KEY__`; the GitHub Pages workflow replaces it only in the temporary deployment artifact using the `STATIC_FORMS_API_KEY` repository secret.

## Run locally

```powershell
dotnet run --project DentalWorks\DentalWorks.csproj
```

## Build

```powershell
dotnet build DentalWorks.slnx -c Release
```

# Virittamo portal SSO

Single sign-on (SSO) is a technology which combines several different application login screens into one.
With SSO, a user only has to enter their login credentials (email, password, etc.) one time on a single page to access all of their SaaS applications.

## Setup

```sh
// install backend and frontend
npm run install

npm run build:dev

npm run dev
```

### Tech used

- React
- express
- MongoDB
- Zustand "🐻 Bear necessities for state management in React"
- TailwindCSS "Rapidly build modern websites without ever leaving your HTML"
- shadcn/ui "Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable"
- TypeScript "Superset of JavaScript that compiles to clean JavaScript output"

### TODO

- [ ] add the ability to add and remove multiple services from a user
- [ ] fix edit service so that the form data persist after a refresh
- [ ] migrate from axios to fetch due to being pointless dependency **RECOMMENDED**
- [ ] finish typescript migration branch name @feature/esm-typescript-conversion (more up to date) **RECOMMENDED**
- [ ] add or remove auth provider if wanted old setup work your choice
  - fixes flashing of if user is not login condition
  - fixes spam pressing refresh page it will logout the user
- [ ] figure out best way to remove service from user
- [ ] close user dropdown when clicking a link
- [ ] make access level in user page table to be clearer
- [ ] users page links would be clickable, and open to new tab (i dont know what i meant with this anymore)
- [ ] add functionality to user services access level form
  - [ ] select does not show select some value( kayttotaso, sovellus) when opening in the first time
- [ ] password reset debugging/setup: I added functioning code for this from another project of mine where it works
    - there were some minor edits mostly to do with environment variables that still need to be done to make it work with this project
    - you can either fix that code or remove it and use your own implementation, whichever you prefer
- [ ] user email validation when registering
    - if the users are to register by themselves it should be validated with an email that they own the email, before adding the user
    - this has not been implemented yet
- [ ] apply virittamoEmail check when registering
    - there is already code to do this in the userRouter registration path: post('/')
    - it only needs to be uncommented once the devs no longer need to use emails other than @edu.hel.fi and @hel.fi, with the production build
- [ ] apply password validation
    - code exists in the registration path and just needs to be uncommented (currently disabled for easier dev account creation)
- [ ] limit the number of requests that a single user can do to the /api/authenticate path, so that no one can even try to brute force a user's password
- [ ] add the token blacklist to the database, now it is just in memory
    - if you implement this remember to also remove the expired tokens from there regularly

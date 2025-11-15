# Q-Lost-And-Found

A web-based Lost & Found management system built with vanilla JavaScript and Tailwind CSS.

## Features

- 🔐 User authentication (login/signup)
- 📝 Post lost or found items with photos
- 🔍 Search and filter items by type, location, and keywords
- 👤 User dashboard to manage items
- 👨‍💼 Admin dashboard with analytics
- 🗑️ Recycle bin for deleted items (admin only)
- 🎨 Dark/Light theme toggle
- 💾 LocalStorage-based data persistence

## Project Structure

```
Q-Lost-And-Found/
├── FINAL PROJECT/
│   └── final TRY/
│       ├── index.html           # Entry point (redirects to login)
│       ├── login.html           # Login page
│       ├── signup.html          # User registration
│       ├── dashboard.html       # Main dashboard
│       ├── admin-dashboard.html # Admin panel
│       ├── app.js               # Main application logic
│       ├── utils.js             # Utility functions & data management
│       └── _redirects           # Netlify routing rules
├── netlify.toml                 # Netlify configuration
└── .gitignore
```

## Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

## Deployment on Netlify

### Option 1: Deploy from Git (Recommended)

1. **Push your code to GitHub** (if not already done)

2. **Connect to Netlify:**
   - Go to [Netlify](https://www.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider and authorize Netlify
   - Select the `sparsh2305/Q-Lost-And-Found` repository

3. **Configure build settings:**
   - The `netlify.toml` file in the repository will automatically configure:
     - **Publish directory:** `FINAL PROJECT/final TRY`
     - **Build command:** (none needed - static site)

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically deploy your site
   - Your site will be available at a URL like `https://your-site-name.netlify.app`

### Option 2: Manual Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy from the project root:**
   ```bash
   cd Q-Lost-And-Found
   netlify deploy --prod --dir="FINAL PROJECT/final TRY"
   ```

### Option 3: Drag and Drop Deploy

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the `FINAL PROJECT/final TRY` folder
3. Your site will be deployed instantly

## Local Development

Since this is a static site using localStorage, you can run it locally with any static server:

### Using Python:
```bash
cd "FINAL PROJECT/final TRY"
python -m http.server 8000
# Visit http://localhost:8000
```

### Using Node.js (http-server):
```bash
npm install -g http-server
cd "FINAL PROJECT/final TRY"
http-server -p 8000
# Visit http://localhost:8000
```

### Using VS Code Live Server:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Configuration

### Security Headers

The `netlify.toml` file includes security headers:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer policy

### Custom Domain

To use a custom domain:
1. Go to your Netlify site dashboard
2. Navigate to "Domain settings"
3. Click "Add custom domain"
4. Follow the DNS configuration instructions

## Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Styling:** Tailwind CSS (CDN)
- **Charts:** Chart.js (for admin analytics)
- **Storage:** LocalStorage API
- **Deployment:** Netlify

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

**Note:** LocalStorage must be enabled for the application to work properly.

## Features Overview

### User Features
- Create an account and login
- Post lost items with details (title, date, location, description, photo, contact)
- Post found items
- Search and filter items
- Mark items as resolved
- View all posted items (public access as guest)

### Admin Features
- All user features
- View analytics dashboard
- Access recycle bin
- Restore or permanently delete items
- View system logs

## Known Limitations

- Data is stored in browser's localStorage (not a backend database)
- Data is local to each browser and not synced across devices
- Photo uploads are stored as base64 in localStorage (size limitations may apply)
- No real-time updates between different users

## Future Enhancements

Potential improvements could include:
- Backend API integration (Node.js/Express, Firebase, etc.)
- Real-time updates using WebSockets
- Email notifications
- Image optimization and cloud storage
- Mobile app version
- Export/Import data functionality

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please open an issue on GitHub.

---

**Deployed with ❤️ on Netlify**

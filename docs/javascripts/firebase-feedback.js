import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, doc, setDoc, updateDoc, increment, getDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBiJKGcTfN8TBehRwFOImuIkj_oxTjmR1g",
    authDomain: "dionlabs-fe92e.firebaseapp.com",
    projectId: "dionlabs-fe92e",
    storageBucket: "dionlabs-fe92e.firebasestorage.app",
    messagingSenderId: "263927058814",
    appId: "1:263927058814:web:174e2923254557ca9a232f",
    measurementId: "G-61ZYV30HGQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getSlug() {
    let path = window.location.pathname;
    path = path.replace(/\/$/, "").replace("/index.html", "");
    const parts = path.split('/');
    return parts.pop() || 'home';
}

function runSignalEngine() {
    const currentSlug = getSlug();
    const isPostPage = window.location.pathname.includes('/blog/') && currentSlug !== 'blog';
    
    console.log(`[Signals] Engine Active. Page: ${isPostPage ? 'Post' : 'Home'}. Slug: ${currentSlug}`);

    // 1. Identify what to track
    const slugsToTrack = new Set();
    if (isPostPage) slugsToTrack.add(currentSlug);
    document.querySelectorAll('[data-slug]').forEach(el => slugsToTrack.add(el.getAttribute('data-slug')));

    // 2. View Count Logic
    if (isPostPage) {
        const statsRef = doc(db, "blog_stats", currentSlug);
        const sessionKey = `viewed_${currentSlug}`;
        if (!sessionStorage.getItem(sessionKey)) {
            setDoc(statsRef, { views: increment(1) }, { merge: true })
                .then(() => sessionStorage.setItem(sessionKey, 'true'));
        }

        // Like Button Setup
        const likeBtn = document.getElementById('like-btn');
        if (likeBtn) {
            const likedKey = `liked_${currentSlug}`;
            if (localStorage.getItem(likedKey)) likeBtn.classList.add('active');
            
            likeBtn.onclick = async () => {
                if (localStorage.getItem(likedKey)) return;
                likeBtn.classList.add('loading');
                await setDoc(statsRef, { likes: increment(1) }, { merge: true });
                localStorage.setItem(likedKey, 'true');
                likeBtn.classList.remove('loading');
                likeBtn.classList.add('active');
            };
        }
    }

    // 3. Real-time Listeners
    slugsToTrack.forEach(slug => {
        onSnapshot(doc(db, "blog_stats", slug), (snap) => {
            const data = snap.exists() ? snap.data() : { views: 0, likes: 0 };
            updateUI(slug, data.views || 0, data.likes || 0);
        });
    });
}

function updateUI(slug, views, likes) {
    // Update Homepage Spans
    document.querySelectorAll(`.view-count[data-slug="${slug}"]`).forEach(el => el.innerText = views.toLocaleString());
    document.querySelectorAll(`.like-count[data-slug="${slug}"]`).forEach(el => el.innerText = likes.toLocaleString());

    // Update Post Page Spans
    if (slug === getSlug()) {
        const v = document.getElementById('view-count');
        const l = document.getElementById('like-count');
        const btn = document.getElementById('like-btn');
        if (v) v.innerText = views.toLocaleString();
        if (l) l.innerText = likes.toLocaleString();
        if (btn && btn.classList.contains('active')) {
            btn.innerHTML = `Signal Received (${likes.toLocaleString()})`;
        }
    }
}

// CRITICAL: Handle MkDocs Material "navigation.instant"
if (typeof document$ !== "undefined") {
    document$.subscribe(function() {
        runSignalEngine();
    });
} else {
    document.addEventListener("DOMContentLoaded", runSignalEngine);
}

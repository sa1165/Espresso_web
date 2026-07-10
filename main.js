// Wait for DOM to load fully
document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initScrollNavbar();
    initThreeJS();
});

/* ==========================================================================
   MOBILE MENU & NAVBAR INTERACTION
   ========================================================================== */
function initMobileMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("open");
            mobileNav.classList.toggle("open");
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("open");
                mobileNav.classList.remove("open");
            });
        });
    }
}

function initScrollNavbar() {
    const header = document.querySelector(".header");
    const sections = document.querySelectorAll(".section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        // Sticky Header shrink on scroll
        if (window.scrollY > 50) {
            header.style.height = "70px";
            header.style.backgroundColor = "rgba(11, 9, 8, 0.92)";
        } else {
            header.style.height = "var(--header-height)";
            header.style.backgroundColor = "rgba(11, 9, 8, 0.75)";
        }

        // Active link tracking
        let currentSectionId = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });

        // Update scroll progress bar
        const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScrollHeight > 0) {
            const progress = (window.scrollY / totalScrollHeight) * 100;
            document.getElementById("progress-bar").style.width = `${progress}%`;
        }
    });
}

/* ==========================================================================
   THREE.JS & SCROLL ANIMATION ORCHESTRATION
   ========================================================================== */
function initThreeJS() {
    // 1. Scene, Camera, Renderer Setup
    const container = document.getElementById("canvas-container");
    if (!container) return;

    const scene = new THREE.Scene();
    
    // Add subtle ambient fog to blend the 3D scene into the dark background
    scene.fog = new THREE.FogExp2(0x0b0908, 0.15);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup (Dramatic Dark Mode Studio Lighting)
    const ambientLight = new THREE.AmbientLight(0x221c1a, 1.2); // Soft warm ambient
    scene.add(ambientLight);

    // Main Warm Spotlight (Casts Shadows)
    const spotLight = new THREE.SpotLight(0xfff3e3, 12, 25, Math.PI / 4, 0.5, 1);
    spotLight.position.set(5, 8, 5);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.bias = -0.0001;
    scene.add(spotLight);

    // Cool Rim Light from Back-Left
    const rimLight = new THREE.DirectionalLight(0xa5c9eb, 3.5);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    // Warm Fill Light from Front-Left
    const fillLight = new THREE.DirectionalLight(0xcfa87b, 2);
    fillLight.position.set(-4, 2, 4);
    scene.add(fillLight);

    // 3. Create the 3D Coffee Cup Group
    const cupGroup = new THREE.Group();
    scene.add(cupGroup);

    // Inner group for local animations (e.g. click bounces) to decouple from layout scroll
    const cupModelGroup = new THREE.Group();
    cupGroup.add(cupModelGroup);

    // Materials
    const ceramicMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f1ed, // Off-white cream
        roughness: 0.12,
        metalness: 0.08,
        bumpScale: 0.05
    });

    const liquidMaterial = new THREE.MeshStandardMaterial({
        color: 0x2b1a11, // Rich Espresso
        roughness: 0.08,
        metalness: 0.1
    });

    // Saucer (Plate)
    const saucerGeometry = new THREE.CylinderGeometry(1.6, 1.1, 0.12, 32);
    // Give saucer a slight indentation
    const posAttr = saucerGeometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i);
        let x = posAttr.getX(i);
        let z = posAttr.getZ(i);
        // Depress the top vertices slightly in the center
        if (y > 0.05 && (x*x + z*z) < 1.4) {
            posAttr.setY(i, y - 0.06);
        }
    }
    saucerGeometry.computeVertexNormals();

    const saucer = new THREE.Mesh(saucerGeometry, ceramicMaterial);
    saucer.position.y = -0.9;
    saucer.castShadow = true;
    saucer.receiveShadow = true;
    cupModelGroup.add(saucer);

    // Coffee Cup Outer Shell (Tapered Cylinder)
    const cupOuterGeo = new THREE.CylinderGeometry(1.1, 0.8, 1.3, 32, 1, true); // Open ended
    const cupOuter = new THREE.Mesh(cupOuterGeo, ceramicMaterial);
    cupOuter.castShadow = true;
    cupOuter.receiveShadow = true;
    cupModelGroup.add(cupOuter);

    // Cup Inside Walls
    const cupInnerGeo = new THREE.CylinderGeometry(1.02, 0.74, 1.22, 32, 1, true);
    const cupInner = new THREE.Mesh(cupInnerGeo, ceramicMaterial);
    cupInner.scale.set(1, -1, 1); // Flip inside out so normals point inward
    cupInner.position.y = 0.02;
    cupInner.receiveShadow = true;
    cupModelGroup.add(cupInner);

    // Cup Rim (Torus/Ring to bridge inner and outer walls)
    const rimGeo = new THREE.TorusGeometry(1.06, 0.04, 8, 32);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, ceramicMaterial);
    rim.position.y = 0.65;
    rim.castShadow = true;
    cupModelGroup.add(rim);

    // Cup Bottom Plate
    const cupBottomGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.08, 32);
    const cupBottom = new THREE.Mesh(cupBottomGeo, ceramicMaterial);
    cupBottom.position.y = -0.61;
    cupBottom.castShadow = true;
    cupModelGroup.add(cupBottom);

    // Cup Handle (Torus)
    const handleGeo = new THREE.TorusGeometry(0.38, 0.09, 12, 32, Math.PI * 1.2);
    handleGeo.rotateZ(-Math.PI * 0.6);
    const handle = new THREE.Mesh(handleGeo, ceramicMaterial);
    handle.position.set(-1.0, 0, 0);
    handle.castShadow = true;
    cupModelGroup.add(handle);

    // Coffee Liquid (Cylinder fitting inside)
    const liquidGeo = new THREE.CylinderGeometry(1.01, 0.95, 0.05, 32);
    const liquid = new THREE.Mesh(liquidGeo, liquidMaterial);
    liquid.position.y = 0.35; // Position liquid below the rim
    liquid.castShadow = false;
    liquid.receiveShadow = true;
    cupModelGroup.add(liquid);

    // Subtle point light inside the cup to make coffee look hot/glowing
    const coffeeGlow = new THREE.PointLight(0xffa254, 0.8, 3);
    coffeeGlow.position.set(0, 0.6, 0);
    cupModelGroup.add(coffeeGlow);

    // Shadow Catcher Table Floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.97;
    floor.receiveShadow = true;
    scene.add(floor);

    // Set initial position & orientation of the cup group
    cupGroup.position.set(1.5, -0.4, 0);
    cupGroup.rotation.set(0.2, -0.5, 0.05);

    // 4. Steam Particle System Setup
    const steamCount = 65;
    const steamGeometry = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);
    const steamSpeeds = [];
    const steamAngles = [];

    for (let i = 0; i < steamCount; i++) {
        // Distribute particles randomly over the liquid surface (radius ~0.9)
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.8;
        const x = Math.cos(angle) * radius;
        const y = 0.38 + Math.random() * 1.5; // Start above liquid
        const z = Math.sin(angle) * radius;

        steamPositions[i * 3] = x;
        steamPositions[i * 3 + 1] = y;
        steamPositions[i * 3 + 2] = z;

        steamSpeeds.push(0.004 + Math.random() * 0.006);
        steamAngles.push(Math.random() * Math.PI * 2);
    }

    steamGeometry.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));

    // Create a smooth round particle texture using HTML canvas
    const createParticleTexture = () => {
        const matCanvas = document.createElement('canvas');
        matCanvas.width = 16;
        matCanvas.height = 16;
        const matContext = matCanvas.getContext('2d');
        const gradient = matContext.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        gradient.addColorStop(0.3, 'rgba(235, 220, 205, 0.25)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        matContext.fillStyle = gradient;
        matContext.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(matCanvas);
    };

    const steamMaterial = new THREE.PointsMaterial({
        size: 0.24,
        map: createParticleTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const steamParticles = new THREE.Points(steamGeometry, steamMaterial);
    cupModelGroup.add(steamParticles);

    // 5. Floating Coffee Beans Setup
    const beansCount = 28;
    const beans = [];

    // Helper to generate a procedural coffee bean geometry
    const createBeanGeometry = () => {
        const beanGeo = new THREE.SphereGeometry(0.18, 16, 16);
        beanGeo.scale(1.2, 1.7, 0.85); // Elongate to spheroid shape
        
        // Displace vertices near center line to create the crease/seam
        const pos = beanGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);
            
            // Displace front Z-vertices slightly inward along the seam
            if (Math.abs(x) < 0.04 && z > 0) {
                pos.setZ(i, z - 0.05);
            }
        }
        beanGeo.computeVertexNormals();
        return beanGeo;
    };

    const beanMaterial = new THREE.MeshStandardMaterial({
        color: 0x362217, // Medium roast brown
        roughness: 0.6,
        metalness: 0.05
    });

    const beanGeoShared = createBeanGeometry();

    for (let i = 0; i < beansCount; i++) {
        const beanMesh = new THREE.Mesh(beanGeoShared, beanMaterial);
        
        // Position beans scattered around
        const angle = Math.random() * Math.PI * 2;
        const radius = 3 + Math.random() * 4;
        const x = Math.cos(angle) * radius;
        const y = -2 + Math.random() * 6;
        const z = -2 - Math.random() * 4; // Behind the main cup
        
        beanMesh.position.set(x, y, z);
        
        // Random orientations
        beanMesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        // Save initial coordinate states for animation floats & scatter offsets
        beans.push({
            mesh: beanMesh,
            baseX: x,
            baseY: y,
            baseZ: z,
            rotSpeedX: 0.002 + Math.random() * 0.005,
            rotSpeedY: 0.002 + Math.random() * 0.005,
            rotSpeedZ: 0.002 + Math.random() * 0.005,
            floatSpeed: 0.0005 + Math.random() * 0.001,
            floatOffset: Math.random() * 100,
            scale: 0.5 + Math.random() * 0.7
        });
        
        beanMesh.scale.setScalar(beans[beans.length - 1].scale);
        beanMesh.castShadow = true;
        scene.add(beanMesh);
    }

    // 6. GSAP ScrollTrigger Integration
    gsap.registerPlugin(ScrollTrigger);

    // Define responsive coordinate states for the cup
    const cupStates = {
        desktop: [
            { x: 1.5, y: -0.4, z: 0, rotX: 0.2, rotY: -0.5, rotZ: 0.05 }, // Hero
            { x: -1.7, y: -0.1, z: 0.5, rotX: 0.3, rotY: 0.6, rotZ: -0.1 },  // About
            { x: 0, y: -0.7, z: 1.2, rotX: 0.7, rotY: 0, rotZ: 0 },          // Menu (view inside)
            { x: 1.7, y: -0.1, z: 0.5, rotX: 0.2, rotY: -0.8, rotZ: 0.1 },   // Craft
            { x: 0, y: -0.3, z: -2.0, rotX: 0.4, rotY: 1.2, rotZ: 0.05 }     // Contact
        ],
        mobile: [
            { x: 0, y: -1.0, z: 0, rotX: 0.1, rotY: -0.3, rotZ: 0 },
            { x: 0, y: -0.2, z: -0.8, rotX: 0.2, rotY: 0.5, rotZ: -0.05 },
            { x: 0, y: -0.9, z: 0.8, rotX: 0.7, rotY: 0, rotZ: 0 },
            { x: 0, y: -0.2, z: -0.8, rotX: 0.1, rotY: -0.6, rotZ: 0.05 },
            { x: 0, y: -0.4, z: -1.5, rotX: 0.3, rotY: 0.8, rotZ: 0 }
        ]
    };

    const mm = gsap.matchMedia();

    // Responsive Scroll Animations Setup
    setupScrollTriggers(cupStates.desktop, true); // Desktop Layouts
    setupScrollTriggers(cupStates.mobile, false); // Mobile Layouts

    function setupScrollTriggers(states, isDesktop) {
        const query = isDesktop ? "(min-width: 769px)" : "(max-width: 768px)";
        
        mm.add(query, () => {
            // Force reset positions on layout media query switch
            gsap.set(cupGroup.position, { x: states[0].x, y: states[0].y, z: states[0].z });
            gsap.set(cupGroup.rotation, { x: states[0].rotX, y: states[0].rotY, z: states[0].rotZ });

            // Transition: Hero -> About
            gsap.to(cupGroup.position, {
                x: states[1].x,
                y: states[1].y,
                z: states[1].z,
                scrollTrigger: {
                    trigger: "#about",
                    start: "top bottom",
                    end: "top top",
                    scrub: 1.2
                }
            });
            gsap.to(cupGroup.rotation, {
                x: states[1].rotX,
                y: states[1].rotY,
                z: states[1].rotZ,
                scrollTrigger: {
                    trigger: "#about",
                    start: "top bottom",
                    end: "top top",
                    scrub: 1.2
                }
            });

            // Transition: About -> Menu
            gsap.to(cupGroup.position, {
                x: states[2].x,
                y: states[2].y,
                z: states[2].z,
                scrollTrigger: {
                    trigger: "#menu",
                    start: "top bottom",
                    end: "top top",
                    scrub: 1.2
                }
            });
            gsap.to(cupGroup.rotation, {
                x: states[2].rotX,
                y: states[2].rotY,
                z: states[2].rotZ,
                scrollTrigger: {
                    trigger: "#menu",
                    start: "top bottom",
                    end: "top top",
                    scrub: 1.2
                }
            });

            // Transition: Menu -> Craft
            gsap.to(cupGroup.position, {
                x: states[3].x,
                y: states[3].y,
                z: states[3].z,
                scrollTrigger: {
                    trigger: "#craft",
                    start: "top bottom",
                    end: "top top",
                    scrub: 1.2
                }
            });
            gsap.to(cupGroup.rotation, {
                x: states[3].rotX,
                y: states[3].rotY,
                z: states[3].rotZ,
                scrollTrigger: {
                    trigger: "#craft",
                    start: "top bottom",
                    end: "top top",
                    scrub: 1.2
                }
            });

            // Transition: Craft -> Contact
            gsap.to(cupGroup.position, {
                x: states[4].x,
                y: states[4].y,
                z: states[4].z,
                scrollTrigger: {
                    trigger: "#contact",
                    start: "top bottom",
                    end: "top top",
                    scrub: 1.2
                }
            });
            gsap.to(cupGroup.rotation, {
                x: states[4].rotX,
                y: states[4].rotY,
                z: states[4].rotZ,
                scrollTrigger: {
                    trigger: "#contact",
                    start: "top bottom",
                    end: "top top",
                    scrub: 1.2
                }
            });

            // Scatter Beans on Scroll
            beans.forEach((bean, idx) => {
                const randomOffset = (idx % 2 === 0 ? 1 : -1) * (1.5 + Math.random() * 2.5);
                gsap.to(bean.mesh.position, {
                    x: bean.baseX + randomOffset,
                    y: bean.baseY + randomOffset * 0.5,
                    scrollTrigger: {
                        trigger: ".scroll-container",
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1.5
                    }
                });
            });
        });
    }

    // Scroll Fade-in text animations
    const fadeElements = document.querySelectorAll(".text-card, .menu-header, .menu-selectors, .menu-details-panel, .contact-header, .contact-form-panel, .contact-info-panel");
    fadeElements.forEach(element => {
        gsap.fromTo(element, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 1.0, 
                ease: "power2.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            }
        );
    });

    // 7. Interactive Menu Setup (Clicking Drinks morphs Liquid)
    const menuItems = document.querySelectorAll(".menu-item");
    const detailsPanels = document.querySelectorAll(".details-content");

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            // Remove active classes
            menuItems.forEach(i => i.classList.remove("active"));
            detailsPanels.forEach(p => p.classList.remove("active"));

            // Add active class to clicked
            item.classList.add("active");
            
            const drink = item.getAttribute("data-drink");
            const targetColorHex = item.getAttribute("data-color");
            const detailsId = `details-${drink}`;
            
            const activeDetails = document.getElementById(detailsId);
            if (activeDetails) {
                activeDetails.classList.add("active");
                // Animate radar bars of flavor
                const bars = activeDetails.querySelectorAll(".bar-fill");
                bars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = "0%";
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 50);
                });
            }

            // Morph 3D Liquid color smoothly
            const parsedColor = new THREE.Color(targetColorHex);
            gsap.to(liquidMaterial.color, {
                r: parsedColor.r,
                g: parsedColor.g,
                b: parsedColor.b,
                duration: 0.8,
                ease: "power2.out"
            });

            // Adjust roughness slightly for textures (milk/foam is rougher, espresso is glossy)
            const roughness = parseFloat(item.getAttribute("data-roughness"));
            gsap.to(liquidMaterial, {
                roughness: roughness,
                duration: 0.8
            });

            // Lightly bounce the cup when drink changes to acknowledge choice
            const initialY = cupModelGroup.position.y;
            gsap.timeline()
                .to(cupModelGroup.position, { y: initialY + 0.12, duration: 0.15, ease: "power1.out" })
                .to(cupModelGroup.position, { y: initialY, duration: 0.35, ease: "bounce.out" });
        });
    });

    // 8. Mouse Movement Parallax Setup (Passive mouse moves nudge scene slightly)
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    window.addEventListener("mousemove", (e) => {
        // Normalize mouse coordinates around center (-0.5 to 0.5)
        targetMouseX = (e.clientX / window.innerWidth) - 0.5;
        targetMouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    // 9. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Smooth mouse parallax lerp
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;

        // Apply mouse parallax to the scene container or cup group rotation
        scene.rotation.y = mouseX * 0.25;
        scene.rotation.x = mouseY * 0.20;

        // Animate Steam Particles
        const positions = steamGeometry.attributes.position.array;
        for (let i = 0; i < steamCount; i++) {
            // Update Y position (moving up)
            positions[i * 3 + 1] += steamSpeeds[i];
            
            // Add subtle organic sway using sin/cos based on elapsed time
            steamAngles[i] += 0.015;
            positions[i * 3] += Math.sin(steamAngles[i] + elapsedTime) * 0.0015;
            positions[i * 3 + 2] += Math.cos(steamAngles[i] + elapsedTime) * 0.0015;

            // Reset steam particle once it rises too high
            if (positions[i * 3 + 1] > 2.2) {
                positions[i * 3 + 1] = 0.38; // Back to liquid surface
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 0.8;
                positions[i * 3] = Math.cos(angle) * radius;
                positions[i * 3 + 2] = Math.sin(angle) * radius;
            }
        }
        steamGeometry.attributes.position.needsUpdate = true;

        // Gently float coffee beans
        beans.forEach(bean => {
            // Float up and down using sin wave
            const floatCycle = Math.sin(elapsedTime * 2.0 + bean.floatOffset);
            bean.mesh.position.y += floatCycle * bean.floatSpeed;
            
            // Apply slow continuous rotation
            bean.mesh.rotation.x += bean.rotSpeedX;
            bean.mesh.rotation.y += bean.rotSpeedY;
            bean.mesh.rotation.z += bean.rotSpeedZ;
        });

        renderer.render(scene, camera);
    };

    animate();

    // 10. Handle Window Resizing
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
}

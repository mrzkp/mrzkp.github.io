class Die {
    constructor(cvsId, opts = {}) {
        this.cvs = document.getElementById(cvsId);
        this.opts = {
            size: opts.size || 450,
            opacity: opts.opacity || 0.3,
            position: {
                top: opts.position?.top || '35%',
                left: opts.position?.left || '22%'
            },
            autoRotate: opts.autoRotate !== false,
            ...opts
        };
       
        this.init();
    }
   
    init() {
        this.cvs.width = this.opts.size;
        this.cvs.height = this.opts.size;
       
        this.scn = new THREE.Scene();
        this.cam = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.rnd = new THREE.WebGLRenderer({
            canvas: this.cvs,
            alpha: true,
            antialias: true
        });
       
        this.rnd.setSize(this.opts.size, this.opts.size);
        this.rnd.setClearColor(0x000000, 0);
        this.rnd.shadowMap.enabled = true;
        this.rnd.shadowMap.type = THREE.PCFSoftShadowMap;
       
        const geo = new THREE.BoxGeometry(3, 3, 3);
       
        const mats = [];
        for (let i = 1; i <= 6; i++) {

            const tex = this.createDitheredTexture(i);
            mats.push(new THREE.MeshPhongMaterial({
                map: tex,
                transparent: true,
                opacity: 0.8
            }));
        }


       
        this.cb = new THREE.Mesh(geo, mats);
        this.cb.castShadow = true;
        this.cb.receiveShadow = true;
        this.scn.add(this.cb);
       
        const ambLt = new THREE.AmbientLight(0x404040, 0.6);
        this.scn.add(ambLt);
       
        const dirLt = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLt.position.set(5, 5, 5);
        dirLt.castShadow = true;
        dirLt.shadow.mapSize.width = 2048;
        dirLt.shadow.mapSize.height = 2048;
        this.scn.add(dirLt);
       
        this.cam.position.z = 5;
       
        this.initInteraction();
       
        this.animate();
    }

   
    createDitheredTexture(dotCnt) {
        const cv = document.createElement('canvas');
        cv.width = 512;
        cv.height = 512;
        const ct = cv.getContext('2d');
       
        const idt = ct.createImageData(512, 512);
       
        for (let y = 0; y < 512; y++) {
            for (let x = 0; x < 512; x++) {
                const i = (y * 512 + x) * 4;
               
                const n1 = Math.sin(x * 0.2) * Math.cos(y * 0.2);
                const n2 = Math.sin(x * 0.1 + y * 0.08) * 0.5;
                const n3 = Math.sin(x * 0.05 + y * 0.03) * 0.3;
                const n4 = Math.random() * 0.4 - 0.2;
                const n5 = Math.sin(x * 0.3 + y * 0.4) * 0.2;
               
                const thresh = 0.3 + n1 * 0.3 + n2 * 0.2 + n3 * 0.15 + n4 * 0.8 + n5 * 0.2;
               
                const b2X = x % 2;
                const b2Y = y % 2;
                const b2Mat = [
                    [0, 2],
                    [3, 1]
                ];
                const b2Val = b2Mat[b2Y][b2X] / 4.0;
               
                const b4X = x % 4;
                const b4Y = y % 4;
                const b4Mat = [
                    [0, 8, 2, 10],
                    [12, 4, 14, 6],
                    [3, 11, 1, 9],
                    [15, 7, 13, 5]
                ];
                const b4Val = b4Mat[b4Y][b4X] / 16.0;
               

                const ordX = x % 8;
                const ordY = y % 8;
                const ordPat = ((ordX + ordY) % 2) * 0.3;
               
                const finThresh = thresh + b2Val * 0.3 + b4Val * 0.3 + ordPat * 0.7;
                const isDk = finThresh > 0.45;
                const baseClr = isDk ? 140 : 220;
                const varn = (Math.random() - 0.5) * 40;
                const clr = Math.max(100, Math.min(255, baseClr + varn));
               
                
                idt.data[i] = clr;
                idt.data[i + 1] = clr;
                idt.data[i + 2] = clr;
                idt.data[i + 3] = 255;
            }
        }
        ct.putImageData(idt, 0, 0);
       
        const poss = this.getDotPositions(dotCnt);
       
        poss.forEach(pos => {
            const ctrX = pos.x * 512;
            const ctrY = pos.y * 512;
            const dotRad = 40;
           
            for (let y = ctrY - dotRad; y <= ctrY + dotRad; y++) {
                for (let x = ctrX - dotRad; x <= ctrX + dotRad; x++) {
                    if (x >= 0 && x < 512 && y >= 0 && y < 512) {
                        const dist = Math.sqrt((x - ctrX) ** 2 + (y - ctrY) ** 2);
                       
                        if (dist <= dotRad) {
                            const i = (Math.floor(y) * 512 + Math.floor(x)) * 4;
                           
                            const edgeDist = dotRad - dist;
                            const edgeThresh = edgeDist / dotRad;
                           
                            const dN1 = Math.random() * 0.3;
                            const dN2 = Math.sin(x * 0.4) * Math.cos(y * 0.4) * 0.2;
                            const dN3 = ((x + y) % 3) * 0.15;
                           
                            const dBX = Math.floor(x) % 2;
                            const dBY = Math.floor(y) % 2;
                            const dBVal = ((dBX + dBY) % 2) * 0.25;
                           
                            const combNoise = dN1 + dN2 + dN3 + dBVal;
                            const shouldDk = (edgeThresh + combNoise) > 0.35;
                           
                            if (shouldDk) {
                                const baseDotClr = 50 + Math.random() * 40;
                                const redTint = baseDotClr + 40;
                                const redGrn = baseDotClr * 0.7;
                                const redBlu = baseDotClr * 0.6;
                                idt.data[i] = Math.min(255, redTint);
                                idt.data[i + 1] = redGrn;
                                idt.data[i + 2] = redBlu;
                                idt.data[i + 3] = 255;
                            }
                        }
                    }
                }
            }
        });
       
        ct.putImageData(idt, 0, 0);
       
        const tex = new THREE.CanvasTexture(cv);
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
        return tex;
    }
   
    getDotPositions(cnt) {
        const poss = [];
        switch(cnt) {
            case 1:
                poss.push({x: 0.5, y: 0.5});
                break;
            case 2:
                poss.push({x: 0.3, y: 0.3}, {x: 0.7, y: 0.7});
                break;
            case 3:
                poss.push({x: 0.3, y: 0.3}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.7});
                break;
            case 4:
                poss.push({x: 0.3, y: 0.3}, {x: 0.7, y: 0.3}, {x: 0.3, y: 0.7}, {x: 0.7, y: 0.7});
                break;
            case 5:
                poss.push({x: 0.3, y: 0.3}, {x: 0.7, y: 0.3}, {x: 0.5, y: 0.5}, {x: 0.3, y: 0.7}, {x: 0.7, y: 0.7});
                break;
            case 6:
                poss.push({x: 0.3, y: 0.25}, {x: 0.7, y: 0.25}, {x: 0.3, y: 0.5}, {x: 0.7, y: 0.5}, {x: 0.3, y: 0.75}, {x: 0.7, y: 0.75});
                break;
        }
        return poss;
    }
   
    initInteraction() {
        this.isRot = false;
        this.lstMX = 0;
        this.lstMY = 0;
        this.rotVX = 0.012;
        this.rotVY = 0.022;
        this.rotVZ = 0.004;
        this.autoRot = true;
       
        this.momX = 0;
        this.momY = 0;
        this.velHist = [];
        this.maxVelHist = 5;
       
        this.cvs.addEventListener('mousedown', (e) => {
            this.isRot = true;
            this.autoRot = false;
            this.lstMX = e.clientX;
            this.lstMY = e.clientY;
            e.preventDefault();
        });
       
        this.cvs.addEventListener('touchstart', (e) => {
            this.isRot = true;
            this.autoRot = false;
            const tch = e.touches[0];
            this.lstMX = tch.clientX;
            this.lstMY = tch.clientY;
            e.preventDefault();
        });
       
        document.addEventListener('mousemove', (e) => {
            if (!this.isRot) return;
           
            const dX = e.clientX - this.lstMX;
            const dY = e.clientY - this.lstMY;
           
            this.velHist.push({ dX, dY, time: Date.now() });
            if (this.velHist.length > this.maxVelHist) {
                this.velHist.shift();
            }
           
            const sens = 0.005;
           
            const rotY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dX * sens);
            const rotX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dY * sens);
           
            this.cb.quaternion.multiplyQuaternions(rotY, this.cb.quaternion);
            this.cb.quaternion.multiplyQuaternions(rotX, this.cb.quaternion);
           
            this.lstMX = e.clientX;
            this.lstMY = e.clientY;
        });
       
        document.addEventListener('touchmove', (e) => {
            if (!this.isRot) return;
           
            const tch = e.touches[0];
            const dX = tch.clientX - this.lstMX;
            const dY = tch.clientY - this.lstMY;
           
            this.velHist.push({ dX, dY, time: Date.now() });
            if (this.velHist.length > this.maxVelHist) {
                this.velHist.shift();
            }
           
            const sens = 0.005;
           
            const rotY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dX * sens);
            const rotX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dY * sens);
           
            this.cb.quaternion.multiplyQuaternions(rotY, this.cb.quaternion);
            this.cb.quaternion.multiplyQuaternions(rotX, this.cb.quaternion);
           
            this.lstMX = tch.clientX;
            this.lstMY = tch.clientY;
            e.preventDefault();
        });
       
        document.addEventListener('mouseup', () => {
            this.isRot = false;
           
            if (this.velHist.length >= 2) {
                const recent = this.velHist.slice(-3);
                let avgDX = 0;
                let avgDY = 0;
               
                for (let i = 0; i < recent.length; i++) {
                    avgDX += recent[i].dX;
                    avgDY += recent[i].dY;
                }
               
                avgDX /= recent.length;
                avgDY /= recent.length;
               
                const momFact = 0.3;
                this.momX = avgDY * momFact * 0.005;
                this.momY = avgDX * momFact * 0.005;
            }
           
            this.velHist = [];
           
            setTimeout(() => {
                if (!this.isRot) {
                    this.autoRot = true;
                    this.rotVX = 0.01;
                    this.rotVY = 0.016;
                    this.rotVZ = 0.006;
                    this.momX = 0;
                    this.momY = 0;
                }
            }, 3000);
        });
       
        document.addEventListener('touchend', () => {
            this.isRot = false;
           
            if (this.velHist.length >= 2) {
                const recent = this.velHist.slice(-3);
                let avgDX = 0;
                let avgDY = 0;
               
                for (let i = 0; i < recent.length; i++) {
                    avgDX += recent[i].dX;
                    avgDY += recent[i].dY;
                }
               
                avgDX /= recent.length;
                avgDY /= recent.length;
               
                const momFact = 0.3;
                this.momX = avgDY * momFact * 0.005;
                this.momY = avgDX * momFact * 0.005;
            }
           
            this.velHist = [];
           
            setTimeout(() => {
                if (!this.isRot) {
                    this.autoRot = true;
                    this.rotVX = 0.01;
                    this.rotVY = 0.016;
                    this.rotVZ = 0.006;
                    this.momX = 0;
                    this.momY = 0;
                }
            }, 3000);
        });
    }
   
    animate() {
        requestAnimationFrame(() => this.animate());
       
        if (this.autoRot) {
            this.cb.rotation.x += this.rotVX;
            this.cb.rotation.y += this.rotVY;
            this.cb.rotation.z += this.rotVZ;
        } else if (!this.isRot && (Math.abs(this.momX) > 0.0001 || Math.abs(this.momY) > 0.0001)) {
            const rotY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.momY);
            const rotX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.momX);
           
            this.cb.quaternion.multiplyQuaternions(rotY, this.cb.quaternion);
            this.cb.quaternion.multiplyQuaternions(rotX, this.cb.quaternion);
           
            this.momX *= 0.98;
            this.momY *= 0.98;
           
            if (Math.abs(this.momX) < 0.0001) this.momX = 0;
            if (Math.abs(this.momY) < 0.0001) this.momY = 0;
        }
       
        this.rnd.render(this.scn, this.cam);
    }
}
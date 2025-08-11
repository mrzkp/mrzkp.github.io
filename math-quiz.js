class MathQuiz {
    constructor(id, opts = {}) {
        this.id = id;
        this.opts = {
            pos: opts.pos || 'fixed-right',
            w: opts.w || '250px',
            ...opts
        };
       
        this.ans = 0;
        this.cont = null;
        this.eqEl = null;
        this.ansIn = null;
       
        this.init();
    }
   
    init() {
        this.createCont();
        this.createEls();
        this.applyStyles();
        this.genEq();
        this.setupListeners();
    }
   
    createCont() {
        const exCont = document.getElementById(this.id);
        if (exCont) {
            exCont.remove();
        }
       
        this.cont = document.createElement('div');
        this.cont.id = this.id;
        this.cont.className = 'math-quiz';
        document.body.appendChild(this.cont);
    }
   
    createEls() {
        this.cont.innerHTML = `
            <div class="skill-check">for ayam</div>
            <div class="quiz-row">
                <div class="equation" id="${this.id}-equation"></div>
                <input type="number" class="math-input" id="${this.id}-answer" placeholder="" />
            </div>
        `;
       
        this.eqEl = document.getElementById(`${this.id}-equation`);
        this.ansIn = document.getElementById(`${this.id}-answer`);
    }
   
    applyStyles() {
        let styleEl = document.getElementById('math-quiz-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'math-quiz-styles';
            document.head.appendChild(styleEl);
        }
       
        const styles = `
            .math-quiz {
                ${this.opts.pos === 'fixed-right' ? `
                    position: fixed;
                    right: 20px;
                    top: 20px;
                ` : ''}
                width: auto;
                min-width: 180px;
                background-color: transparent;
                padding: 12px;
                font-family: "Alliance No.2", Consolas, monospace;
                font-size: 14px;
                color: #333333;
                z-index: 1000;
            }
            
            .math-quiz .skill-check {
                font-size: 12px;
                font-style: italic;
                color: #666666;
                text-align: right;
                margin-bottom: 4px;
            }
           
            .math-quiz .quiz-row {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
            }
           
            .math-quiz .equation {
                font-size: 16px;
                color: #333333;
                white-space: nowrap;
                text-align: right;
            }
           
            .math-quiz .math-input {
                width: 50px;
                height: 24px;
                padding: 2px 4px;
                font-size: 14px;
                text-align: center;
                border: 1px solid #ccc;
                background-color: #ffffff;
                font-family: "Alliance No.2", Consolas, monospace;
                color: #333333;
                -moz-appearance: textfield;
            }
           
            .math-quiz .math-input::-webkit-outer-spin-button,
            .math-quiz .math-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
           
            .math-quiz .math-input:focus {
                border-color: #4a90e2;
                outline: none;
            }
           
           
            @media (max-width: 1024px) {
                .math-quiz {
                    position: static !important;
                    transform: none !important;
                    width: auto !important;
                    margin: 20px auto;
                    max-width: 200px;
                }
            }
        `;
       
        styleEl.textContent = styles;
    }
   
    genEq() {
        const ops = ['+', '-', '×', '÷'];
        const op = ops[Math.floor(Math.random() * ops.length)];
       
        let n1, n2, a;
       
        switch(op) {
            case '+':
                n1 = Math.floor(Math.random() * 100) + 2;
                n2 = Math.floor(Math.random() * 100) + 2;
                a = n1 + n2;
                break;
               
            case '-':
                n1 = Math.floor(Math.random() * 100) + 2;
                n2 = Math.floor(Math.random() * n1) + 2;
                a = n1 - n2;
                break;
               
            case '×':
                n1 = Math.floor(Math.random() * 11) + 2;
                n2 = Math.floor(Math.random() * 99) + 1;
                a = n1 * n2;
                break;
               
            case '÷':
                a = Math.floor(Math.random() * 99) + 1;
                n2 = Math.floor(Math.random() * 11) + 2;
                n1 = a * n2;
                break;
        }
       
        this.ans = a;
        this.eqEl.textContent = `${n1} ${op} ${n2} =`;
        this.ansIn.value = '';
    }
   
    checkAns() {
        const uAns = parseInt(this.ansIn.value);
       
        if (isNaN(uAns)) {
            return;
        }
       
        if (uAns === this.ans) {
            this.genEq();
        }
    }
   
    setupListeners() {
        this.ansIn.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAns();
            }
        });
       
        this.ansIn.addEventListener('input', () => {
            if (this.ansIn.value !== '') {
                this.checkAns();
            }
        });
    }
   
    destroy() {
        if (this.cont) {
            this.cont.remove();
        }
        const styleEl = document.getElementById('math-quiz-styles');
        if (styleEl) {
            styleEl.remove();
        }
    }
   
    hide() {
        if (this.cont) {
            this.cont.style.display = 'none';
        }
    }
   
    show() {
        if (this.cont) {
            this.cont.style.display = 'block';
        }
    }
   
    newQ() {
        this.genEq();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathQuiz;
}
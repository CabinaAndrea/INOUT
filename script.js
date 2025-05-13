document.addEventListener('DOMContentLoaded', () => {
    // --- GESTIONE REGISTRAZIONE ---
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const nome = document.getElementById('nome').value;
            const professione = document.getElementById('professione').value;
            const interessi = document.getElementById('interessi').value;

            const userData = { nome, professione, interessi, passport: {} };
            localStorage.setItem('userData', JSON.stringify(userData));

            const registrationMessage = document.getElementById('registrationMessage');
            registrationMessage.textContent = `Grazie ${nome}! Registrazione completata. Ora puoi esplorare i prodotti.`;
            registrationMessage.style.display = 'block';
            
            // Reindirizza a una pagina "hub" o al primo prodotto dopo un breve ritardo
            // Per ora, l'utente navigherà manualmente.
            // setTimeout(() => { window.location.href = "smart_lock.html"; }, 2000);
            registrationForm.reset();
        });
    }

    // --- LOGICA COMUNE PAGINE PRODOTTO E PASSAPORTO ---
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userGreetingHeader = document.getElementById('userGreetingHeader');
    const userNamePlaceholder = document.getElementById('userNamePlaceholder'); // Nelle pagine prodotto

    if (userData && userData.nome) {
        if (userGreetingHeader) {
            userGreetingHeader.textContent = `Ciao, ${userData.nome}`;
        }
        if (userNamePlaceholder) {
            userNamePlaceholder.textContent = userData.nome;
        }
    } else {
        // Se non ci sono dati utente e non siamo sulla pagina di registrazione, reindirizza
        if (!window.location.pathname.includes('registrazione.html')) {
            // window.location.href = 'registrazione.html';
            // Disabilitato per test locale facile, ma importante per il live
            if(userGreetingHeader) userGreetingHeader.textContent = "Ospite";
            if(userNamePlaceholder) userNamePlaceholder.textContent = "Ospite";
        }
    }
    
    // --- LOGICA SPECIFICA PAGINE PRODOTTO ---
    if (document.querySelector('.product-page')) {
        const productId = document.querySelector('.product-page').id; // es. 'smartLockPage'
        const productTitleText = document.getElementById('productTitle').textContent;

        const btnShowDetails = document.getElementById('btnShowDetails');
        const btnStartExperience = document.getElementById('btnStartExperience');
        const productDetailsDiv = document.getElementById('productDetails');
        const experienceQuizDiv = document.getElementById('experienceQuiz');
        const initialActionsDiv = document.getElementById('initialActions');
        const btnBackToLandingFromDetails = document.getElementById('btnBackToLandingFromDetails');
        const btnBackToLandingFromQuiz = document.getElementById('btnBackToLandingFromQuiz');
        const viewPassportLink = document.getElementById('viewPassportLink');

        // Verifica se l'utente ha già interagito con questo prodotto
        if (userData && userData.passport && userData.passport[productId] && userData.passport[productId].quizCompleted) {
            initialActionsDiv.style.display = 'none';
            experienceQuizDiv.innerHTML = `<p class="message">Hai già completato il test per ${productTitleText}. Le tue risposte sono state salvate.</p>`;
            experienceQuizDiv.style.display = 'block';
            viewPassportLink.style.display = 'inline-block';
        } else if (userData && userData.passport && userData.passport[productId] && userData.passport[productId].detailsViewed) {
             initialActionsDiv.style.display = 'none';
             productDetailsDiv.style.display = 'block';
             viewPassportLink.style.display = 'inline-block';
        }


        btnShowDetails.addEventListener('click', () => {
            initialActionsDiv.style.display = 'none';
            productDetailsDiv.style.display = 'block';
            experienceQuizDiv.style.display = 'none';
            viewPassportLink.style.display = 'inline-block';
            // Segna che i dettagli sono stati visti
            if (userData) {
                if (!userData.passport) userData.passport = {};
                if (!userData.passport[productId]) userData.passport[productId] = {};
                userData.passport[productId].detailsViewed = true;
                userData.passport[productId].productName = productTitleText;
                localStorage.setItem('userData', JSON.stringify(userData));
            }
        });

        btnStartExperience.addEventListener('click', () => {
            initialActionsDiv.style.display = 'none';
            productDetailsDiv.style.display = 'none';
            experienceQuizDiv.style.display = 'block';
            document.getElementById('quizQuestion1').style.display = 'block'; // Mostra la prima domanda
            viewPassportLink.style.display = 'inline-block';
             // Segna che il quiz è iniziato (o i dettagli sono stati visti implicitamente)
            if (userData) {
                if (!userData.passport) userData.passport = {};
                if (!userData.passport[productId]) userData.passport[productId] = {};
                userData.passport[productId].quizStarted = true;
                userData.passport[productId].productName = productTitleText;
                localStorage.setItem('userData', JSON.stringify(userData));
            }
        });

        function goBackToLanding() {
            productDetailsDiv.style.display = 'none';
            experienceQuizDiv.style.display = 'none';
            document.getElementById('quizCompleteMessage').style.display = 'none';
            document.getElementById('btnBackToLandingFromQuiz').style.display = 'none';
            // Resetta la visualizzazione delle domande del quiz
            const questions = experienceQuizDiv.querySelectorAll('.quiz-question');
            questions.forEach((q,i) => q.style.display = i === 0 ? 'none' : 'none');


            initialActionsDiv.style.display = 'block';
        }
        btnBackToLandingFromDetails.addEventListener('click', goBackToLanding);
        btnBackToLandingFromQuiz.addEventListener('click', goBackToLanding);


        // Gestione Quiz
        const quizQuestions = experienceQuizDiv.querySelectorAll('.quiz-question');
        let currentQuestionIndex = 0;
        const answers = {};

        experienceQuizDiv.querySelectorAll('.btn-quiz-option').forEach(button => {
            button.addEventListener('click', function() {
                const questionDiv = this.closest('.quiz-question');
                const questionText = questionDiv.querySelector('p').textContent;
                answers[questionText] = this.dataset.answer;

                // Opzionale: stile per l'opzione selezionata
                // questionDiv.querySelectorAll('.btn-quiz-option').forEach(btn => btn.classList.remove('selected'));
                // this.classList.add('selected');

                questionDiv.style.display = 'none';
                currentQuestionIndex++;
                if (currentQuestionIndex < quizQuestions.length) {
                    quizQuestions[currentQuestionIndex].style.display = 'block';
                } else {
                    // Quiz completato
                    document.getElementById('quizCompleteMessage').style.display = 'block';
                    document.getElementById('btnBackToLandingFromQuiz').style.display = 'inline-block';
                    if (userData) {
                        if (!userData.passport) userData.passport = {};
                        if (!userData.passport[productId]) userData.passport[productId] = {};
                        userData.passport[productId].quizCompleted = true;
                        userData.passport[productId].answers = answers;
                        userData.passport[productId].productName = productTitleText; // Assicura che il nome sia salvato
                        localStorage.setItem('userData', JSON.stringify(userData));
                    }
                }
            });
        });
    }

    // --- LOGICA PAGINA PASSAPORTO ---
    if (document.getElementById('passportData') && userData) {
        document.getElementById('passportUserName').textContent = userData.nome || 'N/D';
        document.getElementById('passportProfessione').textContent = userData.professione || 'N/D';
        document.getElementById('passportInteressi').textContent = userData.interessi || 'N/D';

        const productDetailsContainer = document.getElementById('passportProductDetails');
        if (userData.passport && Object.keys(userData.passport).length > 0) {
            productDetailsContainer.innerHTML = ''; // Pulisci il messaggio di default
            for (const productId in userData.passport) {
                const productData = userData.passport[productId];
                const productEntryDiv = document.createElement('div');
                productEntryDiv.classList.add('product-entry');
                
                let productHTML = `<h4>${productData.productName || productId}</h4>`;
                if (productData.quizCompleted && productData.answers) {
                    productHTML += '<p><strong>Risposte al Test Esperienziale:</strong></p><ul>';
                    for (const question in productData.answers) {
                        productHTML += `<li><em>${question}</em>: ${productData.answers[question]}</li>`;
                    }
                    productHTML += '</ul>';
                } else if (productData.detailsViewed) {
                    productHTML += '<p><em>Dettagli visualizzati, test non completato.</em></p>';
                } else {
                     productHTML += '<p><em>Prodotto visitato.</em></p>';
                }
                productEntryDiv.innerHTML = productHTML;
                productDetailsContainer.appendChild(productEntryDiv);
            }
        }
        // Bottone per cancellare i dati
        const clearDataBtn = document.getElementById('clearDataBtn');
        if(clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if(confirm("Sei sicuro di voler cancellare tutti i dati e iniziare una nuova esperienza?")) {
                    localStorage.removeItem('userData');
                    window.location.href = 'registrazione.html';
                }
            });
        }
    } else if (document.getElementById('passportData') && !userData) {
         document.getElementById('passportData').innerHTML = "<p>Nessun dato utente trovato. Per favore <a href='registrazione.html'>registrati</a> prima.</p>";
    }

});
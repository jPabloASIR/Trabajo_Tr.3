// Variables globales para manejar los datos, estado del cuestionario y temporizador
let xmlData;               // Almacena el XML con las preguntas
let currentQuestion = 0;   // Índice de la pregunta actual
let score = 0;             // Puntuación acumulada
let timerInterval;         // Referencia al intervalo del temporizador
let time = 0;              // Tiempo transcurrido en segundos
let selectedLanguage = 'es'; // Idioma seleccionado (por defecto español)
let selectedChoice = null; // Opción seleccionada en la pregunta actual
let answered = false;      // Indica si la pregunta actual ya fue respondida


// Actualiza todos los textos de la interfaz según el idioma seleccionado
function updateLanguage() {
  const lang = document.getElementById("language").value;
  selectedLanguage = lang;

  // Diccionario con traducciones para español e inglés
  const translations = {
    es: {
      title: "Concurso de Preguntas",
      start: "Comenzar",
      time: "Tiempo",
      score: "Puntuación",
      next: "Siguiente",
      end: "¡Has completado el test!",
      restart: "Reiniciar",
      confirm: "Confirmar"
    },
    en: {
      title: "Quiz Game",
      start: "Start",
      time: "Time",
      score: "Score",
      next: "Next",
      end: "You have completed the quiz!",
      restart: "Restart",
      confirm: "Confirm"
    }
  };

  const t = translations[lang];

  // Actualiza los textos visibles en el HTML con las traducciones correspondientes
  document.getElementById("title-text").textContent = t.title;
  document.getElementById("start-button").textContent = t.start;
  document.getElementById("timer").textContent = `${t.time}: ${time}s`;
  document.getElementById("score").textContent = `${t.score}: ${score}`;
  document.getElementById("next-btn").textContent = t.next;
  document.getElementById("end-title").textContent = t.end;
  document.getElementById("restart-button").textContent = t.restart;
  document.getElementById("confirm-btn").textContent = t.confirm;
}


// Inicia el cuestionario: carga el XML con las preguntas, oculta la pantalla de inicio y muestra la primera pregunta
function startQuiz() {
  selectedLanguage = document.getElementById('language').value;
  // Decide qué archivo XML cargar según el idioma seleccionado
  const file = selectedLanguage === 'es' ? 'askES.xml' : 'askEN.xml';

  // Fetch para obtener el archivo XML
  fetch(file)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
      xmlData = data;  // Guarda el XML en la variable global
      // Cambia pantallas. Oculta la de inicio y muestra la del cuestionario
      document.getElementById('start-screen').classList.remove('active');
      document.getElementById('quiz-screen').classList.add('active');
      startTimer();    // Arranca el temporizador
      showQuestion();  // Muestra la primera pregunta
    });
}


// Muestra la pregunta actual y las opciones de respuesta
function showQuestion() {
  const questions = xmlData.getElementsByTagName('question');

  // Si no hay más preguntas, termina el cuestionario
  if (currentQuestion >= questions.length) {
    endQuiz();
    return;
  }

  const question = questions[currentQuestion];
  const wording = question.getElementsByTagName('wording')[0].textContent;
  const choices = question.getElementsByTagName('choice');

  // Reinicia variables para la nueva pregunta
  selectedChoice = null;
  answered = false;
  document.getElementById('confirm-btn').style.display = 'none'; // Oculta botón confirmar al mostrar pregunta

  const container = document.getElementById('question-container');
  container.innerHTML = `<h2>${wording}</h2>`; // Inserta el texto de la pregunta

  // Crea dinámicamente los divs para cada opción de respuesta
  Array.from(choices).forEach(choice => {
    const div = document.createElement('div');
    div.className = 'choice';
    div.textContent = choice.textContent;
    // Guarda si la opción es correcta en un atributo data
    div.setAttribute('data-correct', choice.getAttribute('correct'));
    // Añade el evento click para seleccionar la respuesta
    div.onclick = () => selectAnswer(div, choice.getAttribute('correct') === 'yes');
    container.appendChild(div);
  });
}


// Marca una opción como seleccionada y permite confirmar la respuesta
function selectAnswer(div, correct) {
  if (answered) return; // No permite cambiar si ya se confirmó la respuesta

  // Elimina la selección previa de todas las opciones
  const allChoices = document.querySelectorAll('.choice');
  allChoices.forEach(c => c.classList.remove('selected'));

  div.classList.add('selected');  // Marca la opción seleccionada

  // Guarda la opción seleccionada y si es correcta o no
  selectedChoice = { div, correct };

  // Muestra el botón para confirmar la respuesta
  document.getElementById('confirm-btn').style.display = 'inline-block';
}


// Al confirmar la respuesta, marca opciones correctas/incorrectas y actualiza puntuación
function confirmAnswer() {
  if (!selectedChoice || answered) return; // Solo si hay selección y no está respondida

  answered = true; // Marca la pregunta como respondida
  document.getElementById('confirm-btn').style.display = 'none'; // Oculta el botón confirmar

  const allChoices = document.querySelectorAll('.choice');
  allChoices.forEach(c => {
    // Determina si la opción es correcta para marcarla
    const isCorrect = c.textContent === selectedChoice.div.textContent
      ? selectedChoice.correct
      : c.getAttribute('data-correct') === 'yes';

    if (isCorrect) {
      c.classList.add('correct');  // Marca en verde
    } else if (c.classList.contains('selected')) {
      c.classList.add('incorrect'); // Marca en rojo la incorrecta seleccionada
    }

    // Desactiva más clics en las opciones una vez respondida
    c.onclick = null;
  });

  // Si la respuesta fue correcta, suma un punto
  if (selectedChoice.correct) score++;

  // Actualiza el texto de la puntuación visible
  const label = selectedLanguage === 'es' ? 'Puntuación' : 'Score';
  document.getElementById('score').textContent = `${label}: ${score}`;
}


// Pasa a la siguiente pregunta incrementando el índice y mostrando la nueva pregunta
function nextQuestion() {
  currentQuestion++;
  showQuestion();
}


// Finaliza el cuestionario: detiene el temporizador, oculta el cuestionario y muestra la pantalla final con la puntuación
function endQuiz() {
  clearInterval(timerInterval); // Detiene el temporizador
  document.getElementById('quiz-screen').classList.remove('active');
  document.getElementById('end-screen').classList.add('active');

  // Mensaje final según idioma
  const finalText = selectedLanguage === 'es'
    ? `Tu puntuación es: ${score}`
    : `Your score is: ${score}`;

  document.getElementById('final-score').textContent = finalText;
}


// Inicia y actualiza cada segundo el temporizador
function startTimer() {
  const label = selectedLanguage === 'es' ? 'Tiempo' : 'Time';
  timerInterval = setInterval(() => {
    time++;

    // Formatea el tiempo en horas, minutos y segundos (00:00:00)
    const hours = String(Math.floor(time / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');

    document.getElementById('timer').textContent = `${label}: ${hours}:${minutes}:${seconds}`;
  }, 1000);
}

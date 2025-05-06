let xmlData;
let currentQuestion = 0;
let score = 0;
let timerInterval;
let time = 0;
let selectedLanguage = 'es'; 
let selectedChoice = null;
let answered = false;

function updateLanguage() {
  const lang = document.getElementById("language").value;
  selectedLanguage = lang;

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

  document.getElementById("title-text").textContent = t.title;
  document.getElementById("start-button").textContent = t.start;
  document.getElementById("timer").textContent = `${t.time}: ${time}s`;
  document.getElementById("score").textContent = `${t.score}: ${score}`;
  document.getElementById("next-btn").textContent = t.next;
  document.getElementById("end-title").textContent = t.end;
  document.getElementById("restart-button").textContent = t.restart;
  document.getElementById("confirm-btn").textContent = t.confirm;
}

function startQuiz() {
  selectedLanguage = document.getElementById('language').value;
  const file = selectedLanguage === 'es' ? 'askES.xml' : 'askEN.xml';

  fetch(file)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
      xmlData = data;
      document.getElementById('start-screen').classList.remove('active');
      document.getElementById('quiz-screen').classList.add('active');
      startTimer();
      showQuestion();
    });
}

function showQuestion() {
  const questions = xmlData.getElementsByTagName('question');
  if (currentQuestion >= questions.length) {
    endQuiz();
    return;
  }

  const question = questions[currentQuestion];
  const wording = question.getElementsByTagName('wording')[0].textContent;
  const choices = question.getElementsByTagName('choice');

  selectedChoice = null;
  answered = false;
  document.getElementById('confirm-btn').style.display = 'none';

  const container = document.getElementById('question-container');
  container.innerHTML = `<h2>${wording}</h2>`;

  Array.from(choices).forEach(choice => {
    const div = document.createElement('div');
    div.className = 'choice';
    div.textContent = choice.textContent;
    div.onclick = () => selectAnswer(div, choice.getAttribute('correct') === 'yes');
    container.appendChild(div);
  });
}

function selectAnswer(div, correct) {
  if (answered) return;

  const allChoices = document.querySelectorAll('.choice');
  allChoices.forEach(c => c.classList.remove('selected'));
  div.classList.add('selected');

  selectedChoice = { div, correct };
  document.getElementById('confirm-btn').style.display = 'inline-block';
}

function confirmAnswer() {
  if (!selectedChoice || answered) return;

  answered = true;
  document.getElementById('confirm-btn').style.display = 'none';

  if (selectedChoice.correct) score++;

  const label = selectedLanguage === 'es' ? 'Puntuación' : 'Score';
  document.getElementById('score').textContent = `${label}: ${score}`;

  
  const allChoices = document.querySelectorAll('.choice');
  allChoices.forEach(c => c.onclick = null);
}

function nextQuestion() {
  currentQuestion++;
  showQuestion();
}

function endQuiz() {
  clearInterval(timerInterval);
  document.getElementById('quiz-screen').classList.remove('active');
  document.getElementById('end-screen').classList.add('active');

  const finalText = selectedLanguage === 'es'
    ? `Tu puntuación es: ${score}`
    : `Your score is: ${score}`;

  document.getElementById('final-score').textContent = finalText;
}

function startTimer() {
  const label = selectedLanguage === 'es' ? 'Tiempo' : 'Time';
  timerInterval = setInterval(() => {
    time++;

    const hours = String(Math.floor(time / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');

    document.getElementById('timer').textContent = `${label}: ${hours}:${minutes}:${seconds}`;
  }, 1000);
}

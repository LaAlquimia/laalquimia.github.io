function notifyMe(symbol, message) {
    if (Notification.permission !== 'granted')
     Notification.requestPermission();
    else {
      // add symbol to notification
     var notification = new Notification('La Alquimia '+ symbol+' Alert 🚨! ⚠️', {
      icon: '/favicon.ico',
      body: ''+message + 'BUY ALQ 🚀',
     });
     notification.onclick = function() {
      window.open('/');
     };
    }
   };
function speak(text, languaje= 'es-US') {
    var msg = new SpeechSynthesisUtterance();
    msg.text = text +'Compra ALQ';
    msg.lang = languaje;        
    window.speechSynthesis.speak(msg);
};

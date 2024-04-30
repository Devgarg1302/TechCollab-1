// Activate the first tab on page load
document.getElementById('tab1-tab').click();

// Slide transition when switching tabs
$('.nav-link').on('shown.bs.tab', function () {
  var targetTabPane = $($(this).attr('href'));
  targetTabPane.addClass('show');
  setTimeout(function () {
    targetTabPane.siblings('.tab-pane').removeClass('show');
  }, 300); // Adjust the duration of the transition (in milliseconds)
});



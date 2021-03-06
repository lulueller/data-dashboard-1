window.onload = main();

function main() {
  loadCityList();
  var cityList = document.getElementById('city-list');
  var generationList = document.getElementById('generation-list');
  cityList.addEventListener('change', loadGeneneration);
  generationList.addEventListener('change', loadStudentList);
  var dashboardMenu  = document.getElementById('dashboard-menu');
  var studentsMenu  = document.getElementById('student-menu');
  var helpMenu  = document.getElementById('help-menu');
  var logoutMenu  = document.getElementById('logout-menu');
  dashboardMenu.addEventListener('click', showDashboardMenu);
  studentsMenu.addEventListener('click', showStudentsMenu);
//  helpMenu.addEventListener('click', );
//  logoutMenu.addEventListener('click', );
}

function showStudentsMenu() {
  var chartsPlace = document.getElementById('charts-place');
  chartsPlace.style.display = 'none';
  var chartsYear = document.getElementById('charts-year');
  chartsYear.style.display = 'none';
  var students = document.getElementById('students');
  students.style.display = 'block';

  loadStudentList();
}

function showDashboardMenu() {
  var chartsPlace = document.getElementById('charts-place');
  chartsPlace.style.display = 'inline';
  var chartsYear = document.getElementById('charts-year');
  chartsYear.style.display = 'inline';
  var students = document.getElementById('students');
  students.style.display = 'none';
}

function loadCityList() {
  var cityList = document.getElementById('city-list');
  for (city in data) {
    var name = getCityName(city);
    var value = city;
    var cityItem = document.createElement('option');
    cityItem.value = value;
    cityItem.innerText = name;
    cityList.appendChild(cityItem);
  }
  var generation = document.getElementById('generation-list');
  //generation.setAttribute("hidden", true);
  generation.style.display = "none";
  var errorMsg = document.getElementById('error-msg');
  errorMsg.style.display = "none";
}

function getCityName(code) {
  var cities = {
    'AQP': 'Arequipa',
    'CDMX': 'Cidade do México',
    'LIM': 'Lima',
    'SCL': 'Santiago do Chile'
  };
  return cities[code];
}

function loadGeneneration() {
  callChartByPlace();
  var cityList = document.getElementById('city-list');
  var generationList = document.getElementById('generation-list');
  generationList.style.display = "inline";
  generationList.innerHTML = '';
  var generationItem = document.createElement('option');
  generationItem.innerText = 'Selecione a turma';
  generationList.appendChild(generationItem);
  //popula o select
  for (generation in data[cityList.value]) {
    generationItem = document.createElement('option');
    generationItem.value = generation;
    generationItem.innerText = generation;
    generationList.appendChild(generationItem);
  }
}

function loadStudentList() {
  callChartByYear();
  var city = document.getElementById('city-list').value;
  var generation = document.getElementById('generation-list').value;
  var errorMsg = document.getElementById('error-msg');
  if (generation === 'Selecione a turma') {
    errorMsg.innerText = 'Selecione uma turma';
    errorMsg.style.display = "block";
    return errorMsg;
  } else {
    errorMsg.style.display = "none";
  }
  var studentsList = document.getElementById('students-list');
  studentsList.innerHTML = '';
  var students = data[city][generation]['students'];
  for (i = 0; i < students.length; i++) {
    var student = students[i];
    addStudentInfo(studentsList, students[i]);
  }
}

function addStudentInfo(list, student) {
  var studentItem = document.createElement('p');
  var studentPhoto = document.createElement('img');
  studentItem.innerText = student.name;
  studentItem.classList.add("student-profile");
  studentPhoto.classList.add("student-pic");
  studentPhoto.src = student.photo;
  studentPhoto.setAttribute('width', 40);
  studentPhoto.setAttribute('height', 40);
  studentItem.appendChild(studentPhoto);
  list.appendChild(studentItem);

}

//Funções saída de graficos por sede
function callChartByPlace() {
  var place = document.getElementById('city-list').value;
  studentsActiveOrNotAll(place);
  targetPlaceAll(place);
  returnNPSAll(place);
  returnStudentsRatingAll(place);
  returnTeachersJedisRatingAll(place);
}

function countStudentsAll(place) {
  var count = 0;
  for (i in data[place]) {
    for (j in data[place][i]['students']) {
      if (isEmpty(data[place][i]['students'][j]) === false) {
        count += 1;
      }
    }
    return count;
  }
}

function studentsActiveOrNotAll(place) {
  var countActive = 0;
  var countInactive = 0;
  for (i in data[place]) {
    for (j in data[place][i]['students']) {
      if (data[place][i]['students'][j]['active'] === true) {
        countActive += 1;
      }
      else {
        countInactive += 1;
      }
      if (isEmpty(data[place][i]['students'][j]) === true) {
        countInactive -= 1;
      }
    }
  }

  var pieData = [
    { name: 'Ativas', y: countActive },
    { name: 'Desistentes', y: countInactive },
  ]

  Highcharts.setOptions({
    colors: ['#f7b731', '#d1d8e0']
  });

  Highcharts.chart('container-studentsActiveOrNot', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Índice de estudantes ativas e desistentes'
    },

    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b><br/><b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {

          color: 'black',
          enabled: true,
          format: 'Total: <b>{point.y}</b><br/><b>{point.percentage: .1f}%</b>',
          distance: -60,
        },
        showInLegend: true
      }
    },
    series: [{
      name: 'Total',
      colorByPoint: true,
      data: pieData
    }]
  });

  var countActivePerc = ((countActive / (countStudentsAll(place))) * 100).toFixed(2);
}

function targetPlaceAll(place) {
  var targetSprint = [];
  var targetHSE = [];
  var targetTech = [];

  for (i in data[place]) {
    for (j in data[place][i]['ratings']) {
      targetSprint[j] = 0;
      targetHSE[j] = 0;
      targetTech[j] = 0;
    }
  }

  for (i in data[place]) {
    for (j in data[place][i]['students']) {
      for (k in data[place][i]['students'][j]['sprints']) {
        if (data[place][i]['students'][j]['sprints'][k]['score']['tech'] >= 1260 && data[place][i]['students'][j]['sprints'][k]['score']['hse'] >= 840) {
          targetSprint[k] += 1;
        }
        if (data[place][i]['students'][j]['sprints'][k]['score']['tech'] >= 1260) {
          targetTech[k] += 1;
        }
        if (data[place][i]['students'][j]['sprints'][k]['score']['hse'] >= 840) {
          targetHSE[k] += 1;
        }
      }
    }
  }
  var averageSprint = parseInt(averageData(targetSprint));
  var averagePercAll = parseInt((averageSprint * 100) / (countStudentsAll(place))/k);
  var averageTech = parseInt(averageData(targetTech));
  var averageTechPercAll = parseInt((averageTech * 100) / (countStudentsAll(place))/k);
  var averageHSE = parseInt(averageData(targetHSE));
  var averageHSEPercAll = parseInt((averageHSE * 100) / (countStudentsAll(place))/k);

  var myDataTechHSE = transformArray(targetSprint);
  var myDataTech = transformArray(targetTech);
  var myDataHSE = transformArray(targetHSE);

  Highcharts.setOptions({
    colors: ['#ED561B', '#058DC7', '#8bbc21']
  });

  Highcharts.chart('container-TargetTechHSE', {
    chart: {
      type: 'line',
      marginRight: 300
    },

    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      x: -30,
      y: 100,
      title: {
        text: '# de Estudantes<br/>'
      },
    },

    title: {
      text: 'Número de Estudantes com Pontuação Técnica e de Habilidades Sócio Emocionais <br/> Acima de 70% da meta'
    },

    xAxis: {
        categories: myDataTechHSE.map(x => x.name)
      },
    yAxis: {
        title: {
          text: 'Número de Estudantes'
        }
      },
    plotOptions: {
        line: {
          dataLabels: {
            enabled: true,

          },
          enableMouseTracking: false
        }
      },
    series: [{
      name: 'Pontuação Técnica e HSE:<br/>- Média de ' + averageSprint + ' estudantes<br/>por sprint (' + averagePercAll+'% do total).',
        data: myDataTechHSE.map(x => x.data),
      }, {
        name: 'Pontuação Técnica:<br/>- Média de ' + averageTech + ' estudantes<br/>por sprint (' + averageTechPercAll + '% do total).',
        data: myDataTech.map(x => x.data),
      }, {
        name: 'Pontuação de HSE:<br/> - Média de ' + averageHSE + ' estudantes<br/>por sprint (' + averageHSEPercAll + ' % do total).',
        data: myDataHSE.map(x => x.data),
      }],
    });
}

function returnNPSAll(place) {
  var promoters = [];
  var passive = [];
  var detractors = [];
  for (i in data[place]) {
    for (j in data[place][i]['ratings']) {
      promoters[j] = (data[place][i]['ratings'][j]['nps']['promoters']);
      passive[j] = (data[place][i]['ratings'][j]['nps']['passive']);
      detractors[j] = (data[place][i]['ratings'][j]['nps']['detractors']);
    }
  }

  var averagePromoters = parseInt(averageData(promoters));
  var averagePassive = parseInt(averageData(passive));
  var averageDetractors = parseInt(averageData(detractors));
  var nps = averagePromoters - averageDetractors;
  var myDataPromoters = transformArray(promoters);
  var myDataPassive = transformArray(passive);
  var myDataDetractors = transformArray(detractors);

  Highcharts.setOptions({
    colors: ['#058DC7', '#8bbc21', '#ED561B']
  });

  Highcharts.chart('container-NPS', {
    chart: {
      type: 'line',
      marginRight: 300
    },
    title: {
      text: 'Net Promoter Score'
    },
    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      x: -100,
      y: 100,
      title: {
        text: 'NPS  ' + nps + '%.',
      },
    },

    xAxis: {
      categories: myDataPromoters.map(x => x.name)
    },
    yAxis: {
      title: {
        text: 'NPS (%)'
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,
        },
        enableMouseTracking: false
      }
    },
    series: [{
      name: 'Promoters:<br/>- Média de ' + averagePromoters + '%.',
      data: myDataPromoters.map(x => x.data),
    }, {
      name: 'Passive:<br/>- Média de ' + averagePassive + '%.',
      data: myDataPassive.map(x => x.data),
    }, {
      name: 'Detractors:<br/>- Média de ' + averageDetractors + '%.',
      data: myDataDetractors.map(x => x.data),
    }],
  });
}

function returnStudentsRatingAll(place) {
  var overExpectation = [];
  var onExpectation = [];
  var underExpectation = [];

  for (i in data[place]) {
    for (j in data[place][i]['ratings']) {
      overExpectation[j] = (data[place][i]['ratings'][j]['student']['supera']);
      onExpectation[j] = (data[place][i]['ratings'][j]['student']['cumple']);
      underExpectation[j] = (data[place][i]['ratings'][j]['student']['no-cumple']);
    }
  }

  var averageOverExpectation = parseInt(averageData(overExpectation));
  var averageOnExpectation = parseInt(averageData(onExpectation));
  var averageUnderExpectation = parseInt(averageData(underExpectation));
  var myDataOver = transformArray(overExpectation);
  var myDataOn = transformArray(onExpectation);
  var myDataUnder = transformArray(underExpectation);

  Highcharts.setOptions({
    colors: ['#058DC7', '#8bbc21', '#ED561B']
  });

  Highcharts.chart('container-ratingsStudents', {
    chart: {
      type: 'line',

    },
    title: {
      text: 'Avaliação de Laboratória pelas estudantes'
    },
    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      x: -60,
      y: 100,
      title: {
        text: 'Média de satisfação',
      },
    },


    xAxis: {
      categories: myDataOver.map(x => x.name)
    },
    yAxis: {
      title: {
        text: 'Avaliação (%)'
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,

        },
        enableMouseTracking: false
      }
    },
    series: [{
      name: 'Supera a expectativa: <br/>- Média de ' + averageOverExpectation + '%.',
      data: myDataOver.map(x => x.data),
    }, {
      name: 'Dentro da expectativa: <br/>- Média de ' + averageOnExpectation + '%.',
      data: myDataOn.map(x => x.data),
    }, {
      name: 'Abaixo da expectativa: <br/>- Média de ' + averageUnderExpectation + '%.',
      data: myDataUnder.map(x => x.data),
    }],
  });
}

function returnTeachersJedisRatingAll(place) {
  var jedi = [];
  var teacher = [];

  for (i in data[place]) {
    for (j in data[place][i]['ratings']) {
      jedi[j] = (data[place][i]['ratings'][j]['jedi']);
      teacher[j] = (data[place][i]['ratings'][j]['teacher']);
    }
  }

  var averageJedi = parseInt(averageData(jedi));
  var averageTeacher = parseInt(averageData(teacher));
  var myDataJedi = transformArray(jedi);
  var myDataTeacher = transformArray(teacher);

  Highcharts.chart('container-ratingsJediTeacher', {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Pontuação de Mentores e Jedis'
    },
    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      x: -60,
      y: 100,
      title: {
        text: 'Média de pontuação',
      },
    },

    xAxis: {
      categories: myDataJedi.map(x => x.name)
    },
    yAxis: {
      title: {
        text: 'Pontuação'
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true
        },
        enableMouseTracking: false
      }
    },
    series: [{
      name: 'Jedis: <br/>- Média de ' + averageJedi + ' pontos.',
      data: myDataJedi.map(x => x.data),
    }, {
      name: 'Mentores: <br/>- Média de ' + averageTeacher + ' pontos.',
      data: myDataTeacher.map(x => x.data),
    }],

  });
}

// Funções saída de graficos por sede e turma
function callChartByYear() {
  var place = document.getElementById('city-list').value;
  var year = document.getElementById('generation-list').value;
  studentsActiveOrNot(place, year);
  targetAll(place, year);
  returnNPS(place, year);
  returnStudentsRating(place, year);
  returnTeachersJedisRating(place, year);
}

function countStudents(place, year) {
  var count = 0;
  for (i in data[place][year]['students']) {
    if (isEmpty(data[place][year]['students'][i]) === false) {
      count += 1;
    }
  }
  return (count);
}

function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop))
      return false;
  }
  return true;
}

function studentsActiveOrNot(place, year) {
  var countActive = 0;
  var countInactive = 0;
  for (i in data[place][year]['students']) {
    if (data[place][year]['students'][i]['active'] === true) {
      countActive += 1;
    }
    else {
      countInactive += 1;
    }
    if (isEmpty(data[place][year]['students'][i]) === true) {
      countInactive -= 1;
    }
  }

  var pieData = [
    { name: 'Ativas', y: countActive },
    { name: 'Desistentes', y: countInactive },
  ]

  Highcharts.setOptions({
    colors: ['#f7b731', '#d1d8e0']
  });

  Highcharts.chart('container-studentsActiveOrNot', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Índice de estudantes ativas e desistentes'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b><br/><b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {

          color: 'black',
          enabled: true,
          format: 'Total: <b>{point.y}</b><br/><b>{point.percentage: .1f}%</b>',
          distance: -60,
        },
        showInLegend: true
      }
    },
    series: [{
      name: 'Total',
      colorByPoint: true,
      data: pieData
    }]
  });

  var countActivePerc = ((countActive / (countStudents(place, year))) * 100).toFixed(2);

}

function targetAll(place, year) {
  var targetSprint = [];
  var targetHSE = [];
  var targetTech = [];
 for (k in data[place][year]['ratings']) {
    targetSprint[k] = 0;
    targetHSE[k] = 0;
    targetTech[k] = 0;
  }

 for (i in data[place][year]['students']) {
    for (j in data[place][year]['students'][i]['sprints']) {
        if (data[place][year]['students'][i]['sprints'][j]['score']['tech'] >= 1260 && data[place][year]['students'][i]['sprints'][j]['score']['hse'] >= 840) {
          targetSprint[j] += 1;
        }
        if (data[place][year]['students'][i]['sprints'][j]['score']['tech'] >= 1260) {
          targetTech[j] += 1;
        }
        if (data[place][year]['students'][i]['sprints'][j]['score']['hse'] >= 840) {
          targetHSE[j] += 1;
        }
    }
 }
      
  
  var averageSprint = parseInt(averageData(targetSprint));
  var averagePercAll = parseInt((averageSprint * 100) / (countStudentsAll(place)) / k);
  var averageTech = parseInt(averageData(targetTech));
  var averageTechPercAll = parseInt((averageTech * 100) / (countStudentsAll(place)) / k);
  var averageHSE = parseInt(averageData(targetHSE));
  var averageHSEPercAll = parseInt((averageHSE * 100) / (countStudentsAll(place)) / k);

  var myDataTechHSE = transformArray(targetSprint);
  var myDataTech = transformArray(targetTech);
  var myDataHSE = transformArray(targetHSE);

  Highcharts.setOptions({
    colors: ['#ED561B', '#058DC7', '#8bbc21']
  });

  Highcharts.chart('container-TargetTechHSE', {
    chart: {
      type: 'line',
      marginRight: 300
    },

    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      x: -30,
      y: 100,
      title: {
        text: 'Índice de Estudantes<br/>'
      },
    },

    title: {
      text: 'Número de Estudantes com Pontuação Técnica e de Habilidades Sócio Emocionais <br/> Acima de 70% da meta'
    },

    xAxis: {
      categories: myDataTechHSE.map(x => x.name)
    },
    yAxis: {
      title: {
        text: 'Número de Estudantes'
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,

        },
        enableMouseTracking: false
      }
    },
    series: [{
      name: 'Pontuação Técnica e HSE:<br/>- Média de ' + averageSprint + ' estudantes<br/>por sprint (' + averagePercAll + '% do total).',
      data: myDataTechHSE.map(x => x.data),
    }, {
      name: 'Pontuação Técnica:<br/>- Média de ' + averageTech + ' estudantes<br/>por sprint (' + averageTechPercAll + '% do total).',
      data: myDataTech.map(x => x.data),
    }, {
      name: 'Pontuação de HSE:<br/> - Média de ' + averageHSE + ' estudantes<br/>por sprint (' + averageHSEPercAll + ' % do total).',
      data: myDataHSE.map(x => x.data),
    }],
  });
}

function returnNPS(place, year) {
  var promoters = [];
  var passive = [];
  var detractors = [];
  for (i in data[place][year]['ratings']) {
    promoters[i] = (data[place][year]['ratings'][i]['nps']['promoters']);
    passive[i] = (data[place][year]['ratings'][i]['nps']['passive']);
    detractors[i] = (data[place][year]['ratings'][i]['nps']['detractors']);
  }

  var averagePromoters = parseInt(averageData(promoters));
  var averagePassive = parseInt(averageData(passive));
  var averageDetractors = parseInt(averageData(detractors));
  var nps = averagePromoters - averageDetractors;
  var myDataPromoters = transformArray(promoters);
  var myDataPassive = transformArray(passive);
  var myDataDetractors = transformArray(detractors);

  Highcharts.setOptions({
    colors: ['#058DC7', '#8bbc21', '#ED561B']
  });

  Highcharts.chart('container-NPS', {
    chart: {
      type: 'line',
      marginRight: 300
    },
    title: {
      text: 'Net Promoter Score'
    },
    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      x: -100,
      y: 100,
      title: {
        text: 'NPS  ' + nps + '%.',
      },
    },

    xAxis: {
      categories: myDataPromoters.map(x => x.name)
    },
    yAxis: {
      title: {
        text: 'NPS (%)'
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,
        },
        enableMouseTracking: false
      }
    },
    series: [{
      name: 'Promoters:<br/>- Média de ' + averagePromoters + '%.',
      data: myDataPromoters.map(x => x.data),
    }, {
      name: 'Passive:<br/>- Média de ' + averagePassive + '%.',
      data: myDataPassive.map(x => x.data),
    }, {
      name: 'Detractors:<br/>- Média de ' + averageDetractors + '%.',
      data: myDataDetractors.map(x => x.data),
    }],
  });
}

function returnStudentsRating(place, year) {
  var overExpectation = [];
  var onExpectation = [];
  var underExpectation = [];
  for (i in data[place][year]['ratings']) {
    overExpectation[i] = (data[place][year]['ratings'][i]['student']['supera']);
    onExpectation[i] = (data[place][year]['ratings'][i]['student']['cumple']);
    underExpectation[i] = (data[place][year]['ratings'][i]['student']['no-cumple']);
  }

  var averageOverExpectation = parseInt(averageData(overExpectation));
  var averageOnExpectation = parseInt(averageData(onExpectation));
  var averageUnderExpectation = parseInt(averageData(underExpectation));
  var myDataOver = transformArray(overExpectation);
  var myDataOn = transformArray(onExpectation);
  var myDataUnder = transformArray(underExpectation);

  Highcharts.setOptions({
    colors: ['#058DC7', '#8bbc21', '#ED561B']
  });

  Highcharts.chart('container-ratingsStudents', {
    chart: {
      type: 'line',

    },
    title: {
      text: 'Avaliação de Laboratória pelas estudantes'
    },
    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      x: -60,
      y: 100,
      title: {
        text: 'Média de satisfação',
      },
    },


    xAxis: {
      categories: myDataOver.map(x => x.name)
    },
    yAxis: {
      title: {
        text: 'Avaliação (%)'
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,

        },
        enableMouseTracking: false
      }
    },
    series: [{
      name: 'Supera a expectativa: <br/>- Média de ' + averageOverExpectation + '%.',
      data: myDataOver.map(x => x.data),
    }, {
      name: 'Dentro da expectativa: <br/>- Média de ' + averageOnExpectation + '%.',
      data: myDataOn.map(x => x.data),
    }, {
      name: 'Abaixo da expectativa: <br/>- Média de ' + averageUnderExpectation + '%.',
      data: myDataUnder.map(x => x.data),
    }],
  });
}

function returnTeachersJedisRating(place, year) {
  var jedi = [];
  var teacher = [];

  for (i in data[place][year]['ratings']) {
    jedi[i] = (data[place][year]['ratings'][i]['jedi']);
    teacher[i] = (data[place][year]['ratings'][i]['teacher']);
  }

  var averageJedi = parseInt(averageData(jedi));
  var averageTeacher = parseInt(averageData(teacher));
  var myDataJedi = transformArray(jedi);
  var myDataTeacher = transformArray(teacher);

  Highcharts.chart('container-ratingsJediTeacher', {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Pontuação de Mentores e Jedis'
    },
    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      x: -60,
      y: 100,
      title: {
        text: 'Média de pontuação',
      },
    },

    xAxis: {
      categories: myDataJedi.map(x => x.name)
    },
    yAxis: {
      title: {
        text: 'Pontuação'
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true
        },
        enableMouseTracking: false
      }
    },
    series: [{
      name: 'Jedis: <br/>- Média de ' + averageJedi + ' pontos.',
      data: myDataJedi.map(x => x.data),
    }, {
      name: 'Mentores: <br/>- Média de ' + averageTeacher + ' pontos.',
      data: myDataTeacher.map(x => x.data),
    }],

  });
}

function transformArray(array) {
  var myData = [];
  for (var n in array) {
    myData.push({});
    var j = 1;
    for (i in myData) {
      myData[i]['name'] = 'SP' + j;
      myData[i]['data'] = array[i];
      j++;
    }
  }
  return myData;
}

function averageData(array) {
  for (var i = 0, sum = 0; i < array.length; sum += array[i++]) { }
  var average = (sum / array.length).toFixed(2);
  return average;
}

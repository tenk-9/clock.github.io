// 天気データ取得スクリプト

// 位置情報を格納する変数
let lat = 35.7505; // デフォルト：東大和市
let lon = 139.4296;
let currentCityName = '東大和市';
let apiUrl = '';

// APIのURLを生成する関数
function generateApiUrl(latitude, longitude) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,precipitation_probability&current=temperature_2m&timezone=Asia%2FTokyo`;
}

// 位置情報を取得する関数
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const weatherDesc = document.getElementById('weather-desc');
    if (weatherDesc) {
      weatherDesc.textContent = '位置情報取得中...';
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log(`現在位置: 緯度 ${latitude}, 経度 ${longitude}`);
        resolve({ lat: latitude, lon: longitude });
      },
      (error) => {
        console.warn('位置情報の取得に失敗:', error.message);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
}

// 都市名を取得する関数（逆ジオコーディング）
async function getCityName(latitude, longitude) {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ja`);
    const data = await response.json();

    let cityName = data.locality || data.city || data.principalSubdivision || '不明な場所';

    if (!cityName || cityName === '不明な場所') {
      cityName = data.principalSubdivision || data.countryName || '不明な場所';
    }

    console.log('取得した都市名:', cityName);
    return cityName;
  } catch (error) {
    console.warn('都市名の取得に失敗:', error);
    return '不明な場所';
  }
}

// 天気コードからアイコンへのマッピング
function getWeatherIcon(weatherCode) {
  if (weatherCode >= 0 && weatherCode <= 3) return '☀️';
  if (weatherCode >= 45 && weatherCode <= 48) return '🌫️';
  if (weatherCode >= 51 && weatherCode <= 57) return '🌧️';
  if (weatherCode >= 61 && weatherCode <= 67) return '🌧️';
  if (weatherCode >= 71 && weatherCode <= 77) return '🌨️';
  if (weatherCode >= 80 && weatherCode <= 82) return '🌧️';
  if (weatherCode >= 85 && weatherCode <= 86) return '🌨️';
  if (weatherCode >= 95 && weatherCode <= 99) return '🌩️';
  return '❓';
}

// 天気コードから天気名へのマッピング
function getWeatherDescription(weatherCode) {
  if (weatherCode === 0) return '快晴';
  if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) return '晴れ';
  if (weatherCode === 45 || weatherCode === 48) return '霧';
  if (weatherCode === 51 || weatherCode === 53 || weatherCode === 55) return '霧雨';
  if (weatherCode === 56 || weatherCode === 57) return '凍雨';
  if (weatherCode === 61 || weatherCode === 63 || weatherCode === 65) return '雨';
  if (weatherCode === 66 || weatherCode === 67) return '凍雨';
  if (weatherCode === 71 || weatherCode === 73 || weatherCode === 75) return '雪';
  if (weatherCode === 77) return '雪片';
  if (weatherCode === 80 || weatherCode === 81 || weatherCode === 82) return 'にわか雨';
  if (weatherCode === 85 || weatherCode === 86) return 'にわか雪';
  if (weatherCode === 95) return '雷雨';
  if (weatherCode === 96 || weatherCode === 99) return '雷雨（雹を伴う）';
  return '不明';
}

// 最終更新時刻を更新する関数
function updateLastUpdateTime() {
  const lastUpdate = document.getElementById('last-update');
  if (!lastUpdate) return;

  const now = new Date();
  const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  lastUpdate.textContent = `${timeString}@${currentCityName}`;
}

// 天気情報取得関数
async function updateWeatherData() {
  const lastUpdate = document.getElementById('last-update');
  if (lastUpdate) {
    lastUpdate.textContent = 'Fetching...';
  }

  try {
    if (!apiUrl) {
      apiUrl = generateApiUrl(lat, lon);
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`天気データの取得に失敗しました: ${response.status}`);
    }
    const data = await response.json();

    console.log('Open-Meteo データ:', data);

    const currentTemp = data.current.temperature_2m;
    const weatherCode = data.daily.weather_code[0];
    const highTemp = data.daily.temperature_2m_max[0];
    const lowTemp = data.daily.temperature_2m_min[0];

    const currentTempEl = document.getElementById('current-temp');
    const weatherDescEl = document.getElementById('weather-desc');
    const weatherIconEl = document.getElementById('weather-icon');
    const highTempEl = document.getElementById('high-temp');
    const lowTempEl = document.getElementById('low-temp');

    if (currentTempEl) currentTempEl.textContent = `${Math.round(currentTemp)}°C`;
    if (weatherDescEl) weatherDescEl.textContent = getWeatherDescription(weatherCode);
    if (weatherIconEl) weatherIconEl.textContent = getWeatherIcon(weatherCode);
    if (highTempEl) highTempEl.textContent = `${Math.round(highTemp)}°C`;
    if (lowTempEl) lowTempEl.textContent = `${Math.round(lowTemp)}°C`;

    updateLastUpdateTime();

  } catch (error) {
    console.error('天気データの取得に失敗しました:', error);
    const weatherIconEl = document.getElementById('weather-icon');
    const weatherDescEl = document.getElementById('weather-desc');
    const currentTempEl = document.getElementById('current-temp');
    const highTempEl = document.getElementById('high-temp');
    const lowTempEl = document.getElementById('low-temp');

    if (weatherIconEl) weatherIconEl.textContent = '❌';
    if (weatherDescEl) weatherDescEl.textContent = '取得失敗';
    if (currentTempEl) currentTempEl.textContent = '--°C';
    if (highTempEl) highTempEl.textContent = '--°C';
    if (lowTempEl) lowTempEl.textContent = '--°C';
  }
}

// 7日間天気予報表示関数
async function updateWeeklyForecast() {
  try {
    if (!apiUrl) {
      apiUrl = generateApiUrl(lat, lon);
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`週間予報データの取得に失敗しました: ${response.status}`);
    }
    const data = await response.json();

    const dailyData = data.daily;
    const weeklyContainer = document.getElementById('weekly-forecast');
    if (!weeklyContainer) return;

    weeklyContainer.innerHTML = '';

    for (let i = 0; i < 7; i++) {
      const date = new Date(dailyData.time[i]);
      const dayName = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
      const weatherCode = dailyData.weather_code[i];
      const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
      const minTemp = Math.round(dailyData.temperature_2m_min[i]);

      const dayElement = document.createElement('div');
      dayElement.className = 'flex flex-col items-center justify-center text-center space-y-1';

      dayElement.innerHTML = `
        <div class="text-base opacity-70">${i === 0 ? '今日' : dayName}</div>
        <div class="text-2xl">${getWeatherIcon(weatherCode)}</div>
        <div class="text-base">
          <span class="text-red-300">${maxTemp}</span><span class="opacity-50">/</span><span class="text-blue-300">${minTemp}</span>
        </div>
      `;

      weeklyContainer.appendChild(dayElement);
    }

  } catch (error) {
    console.error('週間予報データの取得に失敗しました:', error);
    const weeklyContainer = document.getElementById('weekly-forecast');
    if (weeklyContainer) {
      weeklyContainer.innerHTML = '<div class="text-center text-sm opacity-70">予報取得失敗</div>';
    }
  }
}

// 24時間予報グラフ作成関数
async function createForecastChart() {
  try {
    if (!apiUrl) {
      apiUrl = generateApiUrl(lat, lon);
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`予報データの取得に失敗しました: ${response.status}`);
    }
    const data = await response.json();

    console.log('Open-Meteo 予報データ:', data);

    const nowHour = new Date().getHours();
    const hourlyData = data.hourly;
    const labels = [];
    const temps = [];
    const precipitationProb = [];

    const startIndex = hourlyData.time.findIndex(t => new Date(t).getHours() === nowHour);
    if (startIndex === -1) {
      throw new Error('予報データの開始時刻が見つかりません');
    }

    for (let i = 0; i < 24; i++) {
      const index = startIndex + i;
      if (index >= hourlyData.time.length) break;

      const date = new Date(hourlyData.time[index]);
      labels.push(`${String(date.getHours()).padStart(2, '0')}:00`);
      temps.push(hourlyData.temperature_2m[index]);
      const prob = hourlyData.precipitation_probability[index] || 0;
      precipitationProb.push(prob);
    }

    const dailyData = data.daily;
    const today = new Date().toISOString().split('T')[0];

    let todayIndex = dailyData.time.findIndex(d => d === today);
    if (todayIndex === -1) {
      todayIndex = 0;
    }

    const todaySunrise = new Date(dailyData.sunrise[todayIndex]);
    const todaySunset = new Date(dailyData.sunset[todayIndex]);

    let tomorrowSunrise = null;
    if (todayIndex + 1 < dailyData.time.length) {
      tomorrowSunrise = new Date(dailyData.sunrise[todayIndex + 1]);
    }

    let todaySunriseIndex = -1, todaySunsetIndex = -1, tomorrowSunriseIndex = -1;
    const todaySunriseHour = todaySunrise.getHours();
    const todaySunsetHour = todaySunset.getHours();
    const tomorrowSunriseHour = tomorrowSunrise ? tomorrowSunrise.getHours() : -1;

    for (let i = 0; i < labels.length; i++) {
      const hour = parseInt(labels[i].split(':')[0]);
      const chartTime = new Date(hourlyData.time[startIndex + i]);

      if (todaySunriseIndex === -1 && chartTime >= todaySunrise && hour >= todaySunriseHour) {
        todaySunriseIndex = i;
      }

      if (todaySunsetIndex === -1 && chartTime >= todaySunset && hour >= todaySunsetHour) {
        todaySunsetIndex = i;
      }

      if (tomorrowSunrise && tomorrowSunriseIndex === -1 && chartTime >= tomorrowSunrise && hour >= tomorrowSunriseHour) {
        tomorrowSunriseIndex = i;
      }
    }

    const canvas = document.getElementById('forecast-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (window.myChart) {
      window.myChart.destroy();
    }

    const sunriseSunsetPlugin = {
      id: 'sunriseSunset',
      beforeDraw: function(chart, args, options) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const xScale = chart.scales.x;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 220, 0.08)';

        const {todaySunriseIndex, todaySunsetIndex, tomorrowSunriseIndex} = options;

        const now = new Date();
        const currentHour = now.getHours();

        const todaySunriseHour = options.todaySunriseHour || 6;
        const todaySunsetHour = options.todaySunsetHour || 18;

        const isCurrentlyDaytime = currentHour >= todaySunriseHour && currentHour < todaySunsetHour;

        if (isCurrentlyDaytime) {
          if (todaySunsetIndex >= 0) {
            const sunsetX = xScale.getPixelForValue(todaySunsetIndex);
            ctx.fillRect(chartArea.left, chartArea.top, sunsetX - chartArea.left, chartArea.bottom - chartArea.top);
          }

          if (tomorrowSunriseIndex >= 0) {
            const tomorrowSunriseX = xScale.getPixelForValue(tomorrowSunriseIndex);
            ctx.fillRect(tomorrowSunriseX, chartArea.top, chartArea.right - tomorrowSunriseX, chartArea.bottom - chartArea.top);
          }
        } else {
          if (todaySunriseIndex >= 0 && todaySunsetIndex >= 0) {
            const sunriseX = xScale.getPixelForValue(todaySunriseIndex);
            const sunsetX = xScale.getPixelForValue(todaySunsetIndex);
            ctx.fillRect(sunriseX, chartArea.top, sunsetX - sunriseX, chartArea.bottom - chartArea.top);
          }

          if (tomorrowSunriseIndex >= 0) {
            const tomorrowSunriseX = xScale.getPixelForValue(tomorrowSunriseIndex);
            ctx.fillRect(tomorrowSunriseX, chartArea.top, chartArea.right - tomorrowSunriseX, chartArea.bottom - chartArea.top);
          }
        }

        ctx.restore();
      }
    };

    Chart.register(sunriseSunsetPlugin);

    window.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '気温 (°C)',
          data: temps,
          backgroundColor: 'rgba(249, 115, 22, 0.05)',
          borderColor: 'rgba(249, 115, 22, 1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        }, {
          label: '降水確率 (%)',
          data: precipitationProb,
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        layout: {
          padding: {
            bottom: 0
          }
        },
        scales: {
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.8)',
              maxTicksLimit: 8,
              font: { size: 15 },
              maxRotation: 0,
              autoSkip: true,
              padding: 0,
              callback: function(value, index, values) {
                const label = this.getLabelForValue(value);
                if (!label) return '';
                return label.split(':')[0];
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              offset: false
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              color: 'rgba(249, 115, 22, 0.8)',
              font: { size: 15 },
              maxRotation: 0,
              callback: function(value) { return value + '°C'; }
            },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            title: {
              display: false
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            max: 100,
            ticks: {
              color: 'rgba(59, 130, 246, 0.8)',
              font: { size: 15 },
              stepSize: 20,
              maxRotation: 0,
              callback: function(value) { return value + '%'; }
            },
            grid: { drawOnChartArea: false },
            offset: false,
            title: {
              display: false
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += `${Math.round(context.parsed.y)}°C`;
                }
                return label;
              }
            }
          },
          sunriseSunset: {
            todaySunriseIndex: todaySunriseIndex,
            todaySunsetIndex: todaySunsetIndex,
            tomorrowSunriseIndex: tomorrowSunriseIndex,
            todaySunriseHour: todaySunriseHour,
            todaySunsetHour: todaySunsetHour
          }
        }
      }
    });

  } catch (error) {
    console.error('予報グラフの作成に失敗しました:', error);
    const canvas = document.getElementById('forecast-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '18px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('予報データ取得失敗', ctx.canvas.width / 2, ctx.canvas.height / 2);
  }
}

// 位置情報を取得してから天気データを更新する関数
async function initializeWeatherWithLocation() {
  try {
    const location = await getCurrentLocation();
    lat = location.lat;
    lon = location.lon;
    apiUrl = generateApiUrl(lat, lon);

    currentCityName = await getCityName(lat, lon);
    console.log('位置情報を取得しました。天気データを更新します。');
  } catch (error) {
    console.log('位置情報の取得に失敗。デフォルト位置（東大和市）を使用します:', error.message);
    apiUrl = generateApiUrl(lat, lon);
    currentCityName = '東大和市';
    const weatherDescEl = document.getElementById('weather-desc');
    if (weatherDescEl) {
      weatherDescEl.textContent = 'デフォルト位置使用';
    }
  }

  await updateWeatherData();
  await createForecastChart();
  await updateWeeklyForecast();
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeWeatherWithLocation();

  setInterval(updateWeatherData, 300000);
  setInterval(createForecastChart, 300000);
  setInterval(updateWeeklyForecast, 300000);

  setTimeout(() => {
    document.querySelectorAll('.slide-in').forEach((el, index) => {
      el.style.animationDelay = `${index * 0.2}s`;
    });
  }, 100);
});

import { createChart } from 'lightweight-charts'
import { isLogin } from '../../store'
isLogin.listen((login) => {
  if (login) {
    const chartContainer = document.getElementById('chart')!

    const chart = createChart(chartContainer, {
      width: chartContainer.offsetWidth,
      height: chartContainer.offsetHeight,
      watermark: {
        visible: true,
        fontSize: 50,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(171, 71, 188, 0.5)',
        text: 'La Alquimia'
      },
      timeScale: {
        timeVisible: true,
        borderColor: '#D1D4DC',
        rightOffset: 20
      },

      rightPriceScale: {
        borderColor: '#D1D4DC'
      },
      layout: {
        background: {
          color: '#000'
        },
        textColor: '#FFFFFF'
      },
      grid: {
        horzLines: {
          color: '#ffffff20'
        },
        vertLines: {
          color: '#f0f3fa1a'
        }
      }
    })
    const lineSeries = chart.addLineSeries()
    lineSeries.setData([
      { time: '2019-04-11', value: 80.01 },
      { time: '2019-04-12', value: 68.63 },
      { time: '2019-04-13', value: 76.64 },
      { time: '2019-04-14', value: 81.89 },
      { time: '2019-04-15', value: 74.43 },
      { time: '2019-04-16', value: 80.01 },
      { time: '2019-04-17', value: 96.63 },
      { time: '2019-04-18', value: 76.64 },
      { time: '2019-04-19', value: 81.89 },
      { time: '2019-04-20', value: 74.43 },
      { time: '2019-04-21', value: 30.63 },
      { time: '2019-04-22', value: 76.64 },
      { time: '2019-04-23', value: 81.89 },
      { time: '2019-04-24', value: 74.43 },
      { time: '2019-04-25', value: 80.01 },
      { time: '2019-04-26', value: 96.63 },
      { time: '2019-04-27', value: 76.64 },
      { time: '2019-04-28', value: 81.89 },
      { time: '2019-04-29', value: 74.43 }

    ])

    new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== chartContainer) { return }
      const newRect = entries[0].contentRect
      chart.applyOptions({ height: newRect.height, width: newRect.width })
    }).observe(chartContainer)
  }
})


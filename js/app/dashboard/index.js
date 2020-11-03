import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import lottie from 'lottie-web'
import { I18nextProvider } from 'react-i18next'
import moment from 'moment'

import i18n from '../i18n'
import { createStoreFromPreloadedState } from './redux/store'
import DashboardApp from './app'
import LeafletMap from './components/LeafletMap'
import Navbar from './components/Navbar'

import 'react-phone-number-input/style.css'
import './dashboard.scss'

import { taskListUtils } from '../coopcycle-frontend-js/lastmile/redux'

let mapLoadedResolve, navbarLoadedResolve, dashboardLoadedResolve, initMapResolve

const mapLoaded = new Promise((resolve) => mapLoadedResolve = resolve)
const mapInitialized = new Promise((resolve) => initMapResolve = resolve)
const navbarLoaded = new Promise((resolve) => navbarLoadedResolve = resolve)
const dashboardLoaded = new Promise((resolve) => dashboardLoadedResolve = resolve)

function start() {

  const dashboardEl = document.getElementById('dashboard')

  let date = moment(dashboardEl.dataset.date)
  let tasks = JSON.parse(dashboardEl.dataset.tasks)

  let taskEntities = new Map()
  for (let task of tasks) {
    taskEntities.set(task["@id"], task)
  }

  // normalize data, keep only task ids, instead of the whole objects
  let taskLists = JSON.parse(dashboardEl.dataset.taskLists)
  taskLists = taskLists.map(taskList => taskListUtils.replaceTasksWithIds(taskList))
  let taskListEntities = new Map()
  for (let taskList of taskLists) {
    taskListEntities.set(taskList["@id"], taskList)
  }

  let preloadedState = {
    lastmile : {
      date,
      entities: {
        tasks: {
          items: taskEntities
        },
        taskLists: {
          items: taskListEntities
        }
      }
    },
    tags: JSON.parse(dashboardEl.dataset.tags),
    couriersList: JSON.parse(dashboardEl.dataset.couriersList),
    uploaderEndpoint: dashboardEl.dataset.uploaderEndpoint,
    exampleSpreadsheetUrl: dashboardEl.dataset.exampleSpreadsheetUrl,
    jwt: dashboardEl.dataset.jwt,
    nav: dashboardEl.dataset.nav,
  }

  const key = date.format('YYYY-MM-DD')
  const persistedFilters = window.sessionStorage.getItem(`cpccl__dshbd__fltrs__${key}`)
  if (persistedFilters) {
    preloadedState = {
      ...preloadedState,
      filters: JSON.parse(persistedFilters)
    }
  }

  const store = createStoreFromPreloadedState(preloadedState)

  Promise
    .all([ mapLoaded, mapInitialized, navbarLoaded, dashboardLoaded ])
    .then(() => {
      anim.stop()
      anim.destroy()
      document.querySelector('.dashboard__loader').remove()
    })

  render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <LeafletMap onLoad={ () => mapLoadedResolve() } />
      </I18nextProvider>
    </Provider>,
    document.querySelector('.dashboard__map-container')
  )

  render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Navbar />
      </I18nextProvider>
    </Provider>,
    document.querySelector('.dashboard__toolbar-container'),
    function () {
      navbarLoadedResolve()
    }
  )

  render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <DashboardApp />
      </I18nextProvider>
    </Provider>,
    document.querySelector('.dashboard__aside'),
    function () {
      dashboardLoadedResolve()
    }
  )

  // hide export modal after button click
  $('#export-modal button').on('click', () => setTimeout(() => $('#export-modal').modal('hide'), 400))
}

const anim = lottie.loadAnimation({
  container: document.querySelector('#dashboard__loader'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/img/loading.json'
})

window.initMap = function() {
  initMapResolve()
}

anim.addEventListener('DOMLoaded', function() {
  setTimeout(() => start(), 800)
})

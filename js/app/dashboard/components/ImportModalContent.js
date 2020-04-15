import React, { useEffect } from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import Dropzone from 'dropzone'
import { toast } from 'react-toastify'

Dropzone.autoDiscover = false

import "dropzone/dist/dropzone.css"

import { closeImportModal, addImport } from '../redux/actions'

const mimeTypes = [
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream',
  'text/csv',
  'text/plain'
]

const ImportModalContent = ({ addImport, closeImportModal, date, t, url }) => {

  const ref = React.createRef()

  useEffect(() => {

    // componentDidMount

    const dz = new Dropzone(ref.current, {
      url,
      dictDefaultMessage: t('DROPZONE_DEFAULT_MESSAGE'),
      maxFiles: 1,
      acceptedFiles: mimeTypes.join(','),
      params: {
        type: 'tasks',
        date: date.format('YYYY-MM-DD'),
      },
      init: function() {

        this.on('success', function(file, response) {
          closeImportModal()
          addImport(response.token)
          toast(t('ADMIN_DASHBOARD_TASK_IMPORT_PROCESSING'))
        })

        // TODO Allow removing file inside modal
        // this.on('error', function(file, errorMessage, jqXHR) {
        //   file.previewElement.addEventListener("click", function() {
        //     dz.removeFile(file);
        //   })
        // })

      }
    })

    return () => {
      // componentWillUnmount
      dz.destroy()
    }
  }, [])

  return (
    <div>
      <div className="dropzone dropzone--blue mb-3" ref={ ref }></div>
      <span className="text-muted">{ t('ADMIN_DASHBOARD_IMPORT_FILE_FORMATS') }</span>
    </div>
  )
}

function mapStateToProps(state) {

  return {
    date: state.date,
    url: state.uploaderEndpoint,
  }
}

function mapDispatchToProps(dispatch) {

  return {
    closeImportModal: () => dispatch(closeImportModal()),
    addImport: token => dispatch(addImport(token)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ImportModalContent))
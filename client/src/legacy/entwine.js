import jQuery from "jquery"
import React from "react"
import ReactDOM from "react-dom"
import {loadComponent} from "lib/Injector"

jQuery.entwine("ss", function ($) {
	$(".js-injector-boot .form__field-holder .zauberfisch__page-builder__field").entwine({
		PageBuilderEditorQuery: null,
		InputElement: null,
		EditorElement: null,
		onmatch() {
			const PageBuilderField = loadComponent("PageBuilderField")
			const schemaData = this.data("schema")
			this.setInputElement(this.find("> input").get(0))
			this.setEditorElement(this.find("> div").get(0))
			const _this = this
			const props = {
				elements: schemaData.elements,
				value: schemaData.value,
				// value: this.getInputElement().value,
				setPageBuilderEditorQuery: (query) => {
					_this.setPageBuilderEditorQuery(query)
				},
			}

			ReactDOM.render(
				<PageBuilderField {...props} />,
				this.getEditorElement(),
			)
		},

		onunmatch() {
			if (this.getEditorElement()) {
				ReactDOM.unmountComponentAtNode(this.getEditorElement())
			}
		},

		"from .cms-edit-form": {
			onbeforesubmitform: function () {
				if (this.getPageBuilderEditorQuery()) {
					this.getInputElement().value = this.getPageBuilderEditorQuery().serialize()
				} else {
					console.error(`PageBuilder: this.getPageBuilderEditorQuery() did not return a query`)
				}
				this._super()
			},
		},
	})
})

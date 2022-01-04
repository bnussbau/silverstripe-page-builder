import React from "react"
import {Editor, Frame, Element, useEditor} from "@craftjs/core"
import {Toolbar} from "./Toolbar"
import Injector from "lib/Injector"
import styles from "./PageBuilderField.module.scss"
import {PageBuilderContextProvider} from "./PageBuilderContext"
import {RootContainer, UnknownElement} from "./elements"
import {loadComponent} from "lib/Injector"
import {CreateElementButton} from "./element-utilities"

const Loading = loadComponent("Loading")

function EditorInner({value, refToolbarTop, refToolbarRows, setPageBuilderEditorQuery, defaultValue}) {
	const {query} = useEditor()
	React.useEffect(() => {
		setPageBuilderEditorQuery(query)
	}, [])
	return (
		<React.Fragment>
			<Toolbar {...{refToolbarTop, refToolbarRows}} />
			<Frame data={value}>
				{defaultValue}
			</Frame>
		</React.Fragment>
	)
}

function createElement({key, className, singularName, config}) {
	const Component = Injector.component.get(className)
	const specs = {...Component.pageBuilderSpecs, ...config}
	const NewComponent = (props) => <Component {...props} pageBuilderSpecs={specs} />
	NewComponent.craft = {
		props: specs.defaultProps,
		related: {
			CreateButton: specs.canCreate ? (props) => (
				<CreateElementButton {...props} title={singularName} element={<Element canvas={specs.isCanvas} is={NewComponent} />} iconName={specs.iconName} />
			) : undefined,
		},
		rules: specs.isCanvas ? {
			canMoveIn(incomingNodes) {
				if (specs.forbiddenChildren) {
					console.log(`checoing forbiddenChildren`, {forbiddenChildren: specs.forbiddenChildren, incomingName: incomingNodes.length && incomingNodes[0].data.name})
					return !specs.forbiddenChildren.includes(incomingNodes.length && incomingNodes[0].data.name)
				}
				return true
			},
		} : {},
	}
	NewComponent.getTypeDisplayName = () => singularName
	return [key, NewComponent]
}

function PageBuilderField({value, setPageBuilderEditorQuery, elements: allowedElements}) {
	const refPageBuilderContainer = React.createRef()
	const refToolbarTop = React.createRef()
	const refToolbarRows = React.createRef()
	// const [injectorReady, setInjectorReady] = React.useState(false)
	const injectorReady = true
	const [isReady, setIsReady] = React.useState(false)
	// React.useEffect(() => {
	// 	Injector.ready(() => {
	// 		setInjectorReady(true)
	// 	})
	// }, [])
	const [allElements, elements] = React.useMemo(() => {
		if (!injectorReady) {
			return [null, null]
		}
		const valueObject = value ? JSON.parse(value) : null
		const elements = Object.fromEntries(allowedElements.map(createElement))
		elements.RootContainer = elements["zauberfisch\\PageBuilder\\Element\\RootContainer.Default"]
		const allElements = {
			...elements,
		}
		if (valueObject) {
			const usedElementTypes = Object.entries(valueObject).map(([id, element]) => {
				return element.type.resolvedName
			})
			usedElementTypes.forEach(elementType => {
				if (typeof allElements[elementType] === "undefined") {
					allElements[elementType] = UnknownElement
				}
			})
		}
		setIsReady(true)
		return [allElements, elements]
	}, [JSON.stringify(allowedElements), injectorReady])
	if (!isReady) {
		return <div style={{height: 109}}><Loading /></div>
	}
	return (
		<PageBuilderContextProvider {...{
			refPageBuilderContainer,
			elements,
			refToolbarTop,
			refToolbarRows,
		}}>
			<div className={styles.field} ref={refPageBuilderContainer}>
				<Editor resolver={allElements}>
					<EditorInner {...{value, refToolbarTop, refToolbarRows, setPageBuilderEditorQuery}} defaultValue={<Element canvas is={elements.RootContainer} />} />
				</Editor>
			</div>
		</PageBuilderContextProvider>
	)
}

export {PageBuilderField as Component}
export default PageBuilderField
// export default fieldHolder(PageBuilderField)

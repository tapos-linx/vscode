/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ResolvedKeybinding } from 'vs/base/common/keyCodes';
import { URI } from 'vs/base/common/uri';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IMatch } from 'vs/base/common/filters';
import { IItemAccessor } from 'vs/base/common/fuzzyScorer';
import { Schemas } from 'vs/base/common/network';

export interface IQuickPickItemHighlights {
	label?: IMatch[];
	description?: IMatch[];
	detail?: IMatch[];
}

export interface IQuickPickItem {
	type?: 'item';
	id?: string;
	label: string;
	ariaLabel?: string;
	description?: string;
	detail?: string;
	keybinding?: ResolvedKeybinding;
	iconClasses?: string[];
	italic?: boolean;
	highlights?: IQuickPickItemHighlights;
	buttons?: IQuickInputButton[];
	/**
	 * Wether to always show the buttons. By default buttons
	 * are only visible when hovering over them with the mouse
	 */
	buttonsAlwaysVisible?: boolean;
	picked?: boolean;
	alwaysShow?: boolean;
}

export interface IQuickPickSeparator {
	type: 'separator';
	label?: string;
}

export interface IKeyMods {
	readonly ctrlCmd: boolean;
	readonly alt: boolean;
}

export interface IQuickNavigateConfiguration {
	keybindings: ResolvedKeybinding[];
}

export interface IPickOptions<T extends IQuickPickItem> {

	/**
	 * an optional string to show as placeholder in the input box to guide the user what she picks on
	 */
	placeHolder?: string;

	/**
	 * an optional flag to include the description when filtering the picks
	 */
	matchOnDescription?: boolean;

	/**
	 * an optional flag to include the detail when filtering the picks
	 */
	matchOnDetail?: boolean;

	/**
	 * an optional flag to filter the picks based on label. Defaults to true.
	 */
	matchOnLabel?: boolean;

	/**
	 * an option flag to control whether focus is always automatically brought to a list item. Defaults to true.
	 */
	autoFocusOnList?: boolean;

	/**
	 * an optional flag to not close the picker on focus lost
	 */
	ignoreFocusLost?: boolean;

	/**
	 * an optional flag to make this picker multi-select
	 */
	canPickMany?: boolean;

	/**
	 * enables quick navigate in the picker to open an element without typing
	 */
	quickNavigate?: IQuickNavigateConfiguration;

	/**
	 * a context key to set when this picker is active
	 */
	contextKey?: string;

	/**
	 * an optional property for the item to focus initially.
	 */
	activeItem?: Promise<T> | T;

	onKeyMods?: (keyMods: IKeyMods) => void;
	onDidFocus?: (entry: T) => void;
	onDidTriggerItemButton?: (context: IQuickPickItemButtonContext<T>) => void;
}

export interface IInputOptions {

	/**
	 * the value to prefill in the input box
	 */
	value?: string;

	/**
	 * the selection of value, default to the whole word
	 */
	valueSelection?: [number, number];

	/**
	 * the text to display underneath the input box
	 */
	prompt?: string;

	/**
	 * an optional string to show as placeholder in the input box to guide the user what to type
	 */
	placeHolder?: string;

	/**
	 * Controls if a password input is shown. Password input hides the typed text.
	 */
	password?: boolean;

	ignoreFocusLost?: boolean;

	/**
	 * an optional function that is used to validate user input.
	 */
	validateInput?: (input: string) => Promise<string | null | undefined>;
}

export interface IQuickInput extends IDisposable {

	readonly onDidHide: Event<void>;
	readonly onDispose: Event<void>;

	title: string | undefined;

	description: string | undefined;

	step: number | undefined;

	totalSteps: number | undefined;

	enabled: boolean;

	contextKey: string | undefined;

	busy: boolean;

	ignoreFocusOut: boolean;

	show(): void;

	hide(): void;
}

export interface IQuickPick<T extends IQuickPickItem> extends IQuickInput {

	value: string;

	/**
	 * A method that allows to massage the value used
	 * for filtering, e.g, to remove certain parts.
	 */
	filterValue: (value: string) => string;

	ariaLabel: string;

	placeholder: string | undefined;

	readonly onDidChangeValue: Event<string>;

	readonly onDidAccept: Event<void>;

	ok: boolean | 'default';

	readonly onDidCustom: Event<void>;

	customButton: boolean;

	customLabel: string | undefined;

	customHover: string | undefined;

	buttons: ReadonlyArray<IQuickInputButton>;

	readonly onDidTriggerButton: Event<IQuickInputButton>;

	readonly onDidTriggerItemButton: Event<IQuickPickItemButtonEvent<T>>;

	items: ReadonlyArray<T | IQuickPickSeparator>;

	canSelectMany: boolean;

	matchOnDescription: boolean;

	matchOnDetail: boolean;

	matchOnLabel: boolean;

	sortByLabel: boolean;

	autoFocusOnList: boolean;

	quickNavigate: IQuickNavigateConfiguration | undefined;

	activeItems: ReadonlyArray<T>;

	readonly onDidChangeActive: Event<T[]>;

	selectedItems: ReadonlyArray<T>;

	readonly onDidChangeSelection: Event<T[]>;

	readonly keyMods: IKeyMods;

	valueSelection: Readonly<[number, number]> | undefined;

	validationMessage: string | undefined;

	inputHasFocus(): boolean;

	focusOnInput(): void;
}

export interface IInputBox extends IQuickInput {

	value: string;

	valueSelection: Readonly<[number, number]> | undefined;

	placeholder: string | undefined;

	password: boolean;

	readonly onDidChangeValue: Event<string>;

	readonly onDidAccept: Event<void>;

	buttons: ReadonlyArray<IQuickInputButton>;

	readonly onDidTriggerButton: Event<IQuickInputButton>;

	prompt: string | undefined;

	validationMessage: string | undefined;
}

export interface IQuickInputButton {
	/** iconPath or iconClass required */
	iconPath?: { dark: URI; light?: URI; };
	/** iconPath or iconClass required */
	iconClass?: string;
	tooltip?: string;
	alwaysShow?: boolean;
}

export interface IQuickPickItemButtonEvent<T extends IQuickPickItem> {
	button: IQuickInputButton;
	item: T;
}

export interface IQuickPickItemButtonContext<T extends IQuickPickItem> extends IQuickPickItemButtonEvent<T> {
	removeItem(): void;
}

export type QuickPickInput<T = IQuickPickItem> = T | IQuickPickSeparator;


//region Fuzzy Scorer Support

export type IQuickPickItemWithResource = IQuickPickItem & { resource: URI | undefined };

export const quickPickItemScorerAccessor = new class implements IItemAccessor<IQuickPickItemWithResource> {
	getItemLabel(entry: IQuickPickItemWithResource): string {
		return entry.label;
	}

	getItemDescription(entry: IQuickPickItemWithResource): string | undefined {
		return entry.description;
	}

	getItemPath(entry: IQuickPickItemWithResource): string | undefined {
		if (entry.resource?.scheme === Schemas.file) {
			return entry.resource.fsPath;
		}

		return entry.resource?.path;
	}
};

//#endregion

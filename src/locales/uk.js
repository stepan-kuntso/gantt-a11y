/**
 * Ukrainian strings: an example of a translation (see "Translating" in
 * src/core/strings.js). Pass it as `options.strings`:
 *
 *   import { uk } from "./gantt-a11y/src/locales/uk.js";
 *   enableGanttA11y(gantt, { strings: uk });
 *
 * Not yet checked with a screen reader. How it deals with Ukrainian grammar:
 * - Task names are not declined: they follow a colon ("Залежить від: Тестування.")
 *   or a noun that is ("Конфлікт із задачею «Запуск».").
 * - Counted nouns use the four Intl.PluralRules categories of "uk":
 *   one (1, 21), few (2-4, 22-24), many (0, 5-20, 25), other (fractions: 1,5 дня).
 *   They are in the nominative, so the templates put them after a comma or a
 *   colon, never after a preposition that would need another case.
 * - Known limits: "{count} задач" after "від" / "для" is genitive plural, wrong
 *   for 21, 31, ... ("від 21 задачі"); the help item ends with a key letter,
 *   which the English text avoids for VoiceOver (see help.item there).
 */
export const uk = {
	locale: "uk-UA",

	common: {
		unnamedTask: "Задача без назви",
		emptyValue: "порожньо",
		range: "з {from} по {to}",
		endOfList: "Кінець списку.",
		taskList: "Задачі"
	},

	nouns: {
		minute: { one: "{count} хвилина", few: "{count} хвилини", many: "{count} хвилин", other: "{count} хвилини" },
		hour: { one: "{count} година", few: "{count} години", many: "{count} годин", other: "{count} години" },
		day: { one: "{count} день", few: "{count} дні", many: "{count} днів", other: "{count} дня" },
		week: { one: "{count} тиждень", few: "{count} тижні", many: "{count} тижнів", other: "{count} тижня" },
		month: { one: "{count} місяць", few: "{count} місяці", many: "{count} місяців", other: "{count} місяця" },
		year: { one: "{count} рік", few: "{count} роки", many: "{count} років", other: "{count} року" },
		task: { one: "{count} задача", few: "{count} задачі", many: "{count} задач", other: "{count} задачі" },
		change: { one: "{count} зміна", few: "{count} зміни", many: "{count} змін", other: "{count} зміни" },
		subtask: { one: "{count} підзадача", few: "{count} підзадачі", many: "{count} підзадач", other: "{count} підзадачі" },
		link: { one: "{count} зв'язок", few: "{count} зв'язки", many: "{count} зв'язків", other: "{count} зв'язку" },
		conflict: { one: "{count} конфлікт", few: "{count} конфлікти", many: "{count} конфліктів", other: "{count} конфлікту" },
		project: { one: "{count} проєкт", few: "{count} проєкти", many: "{count} проєктів", other: "{count} проєкту" },
		milestone: { one: "{count} віха", few: "{count} віхи", many: "{count} віх", other: "{count} віхи" }
	},

	// Used only as "{unit} на початку" / "{unit} наприкінці", so the numeral
	// agrees with the noun here.
	unitNames: {
		minute: "одна хвилина", hour: "одна година", day: "один день", week: "один тиждень", month: "один місяць", year: "один рік"
	},

	linkTypes: {
		finish_to_start: "закінчення-початок",
		start_to_start: "початок-початок",
		finish_to_finish: "закінчення-закінчення",
		start_to_finish: "початок-закінчення"
	},

	fields: {
		name: "Назва",
		start: "Початок",
		end: "Кінець",
		duration: "Тривалість",
		progress: "Прогрес",
		type: "Тип",
		parent: "Батьківська задача"
	},

	fieldsInList: {
		name: "назва",
		start: "початок",
		end: "кінець",
		duration: "тривалість",
		progress: "прогрес",
		type: "тип",
		parent: "батьківська задача"
	},

	shortcuts: {
		dependencies: "Залежності",
		concurrent: "Одночасні задачі",
		endsBefore: "Закінчуються раніше",
		startsAfter: "Починаються пізніше",
		goToPredecessor: "До того, від чого залежить",
		goToSuccessor: "До того, що залежить від цієї",
		moveEarlier: "Раніше",
		moveLater: "Пізніше",
		longer: "Довше",
		shorter: "Коротше",
		whereAmI: "Де я",
		overview: "Огляд діаграми",
		conflictList: "Наступний конфлікт",
		back: "Назад, туди, де почалися переходи",
		repeat: "Повторити останнє",
		link: "Створити зв'язок",
		linkType: "Тип зв'язку",
		unlink: "Видалити зв'язок",
		help: "Довідка"
	},

	hints: {
		nextPage: "Натисніть ще раз, щоб почути наступні: {count}.",
		opened: "Розгорнуто: {name}."
	},

	pages: {
		page: "Від {from} до {to} з {total}: {list}.",
		pageOfTwo: "{from} і {to} з {total}: {list}.",
		pageOfOne: "{from} з {total}: {list}."
	},

	dependencies: {
		none: "Немає залежностей.",
		dependsOnOne: "Залежить від: {item}.",
		requiredByOne: "Потрібна для: {item}.",
		dependsOnList: "Залежить від {count} задач: {list}.",
		requiredByList: "Потрібна для {count} задач: {list}.",
		dependsOnCount: "Залежить від {count} задач.",
		requiredByCount: "Потрібна для {count} задач.",
		dependsOnFirst: "Залежить від {count} задач. Перші {shown}: {list}.",
		requiredByFirst: "Потрібна для {count} задач. Перші {shown}: {list}.",
		dependsOnSummary: "Залежить від {count} задач. Остання закінчується: {name}, {date}.",
		requiredBySummary: "Потрібна для {count} задач. Перша починається: {name}, {date}.",
		inConflict: "У конфлікті, {count}: {list}.",
		item: "{name}",
		itemTyped: "{name}, {type}",
		itemSentence: "{name}.",
		itemTypedSentence: "{name}, {type}."
	},

	navigation: {
		position: "{n} з {total}",
		positionTyped: "{n} з {total}, {type}",
		jumpedToPredecessor: "{position}. Від цієї задачі залежить: {origin}.",
		jumpedToSuccessor: "{position}. Ця задача залежить від: {origin}.",
		onlyPredecessor: "Від цієї задачі залежить: {origin}.",
		onlyPredecessorTyped: "Від цієї задачі залежить: {origin}, {type}.",
		onlySuccessor: "Ця задача залежить від: {origin}.",
		onlySuccessorTyped: "Ця задача залежить від: {origin}, {type}.",
		noPredecessors: "Ні від чого не залежить.",
		noSuccessors: "Від цієї задачі нічого не залежить.",
		filteredOut: "{position}, {name}, приховано фільтром. Фокус не перемістився.",
		filteredOutOnly: "{name}: приховано фільтром. Фокус не перемістився.",
		backTo: "Назад до: {name}.",
		nothingToGoBack: "Немає куди повертатися."
	},

	overview: {
		tasks: "{count}.",
		tasksShown: "{count}, показано {shown}.",
		kinds: "{list}.",
		span: "{range}.",
		conflicts: "{count}.",
		noConflicts: "Конфліктів немає.",
		largest: "Найбільший: {name}, різниця {amount}, через задачу «{other}».",
		unscheduled: "Без дат: {count}.",
		empty: "Задач немає."
	},

	// "У складі: Backend, API, Website redesign." The names stay undeclined.
	whereAmI: {
		task: "{name}.",
		ancestors: "{list}.",
		ancestorFirst: "У складі: {name}",
		ancestorNext: "{name}",
		position: "Рівень {level}, {n} з {total}.",
		topLevel: "Верхній рівень, {n} з {total}.",
		inside: "Усередині: {count}."
	},

	conflictList: {
		none: "Конфліктів немає.",
		item: "{n} з {total}. {conflict}"
	},

	time: {
		concurrentNone: "Одночасно немає інших задач.",
		concurrentOne: "{count} одночасно: {item}.",
		concurrentFew: "{count} одночасно. {items}",
		concurrentMany: "{count} одночасно.",
		concurrentWhole: "{count} весь час: {list}.",
		concurrentPartly: "{count} частково.",
		partlyPage: "Частково, від {from} до {to} з {total}: {items}",
		item: "{name}, {extent}",
		itemSentence: "{name}, {extent}.",
		milestoneItem: "віха {name}, {date}",
		milestoneItemSentence: "Віха {name}, {date}.",
		whole: "весь час",
		first: "{duration} на початку",
		firstOne: "{unit} на початку",
		last: "{duration} наприкінці",
		lastOne: "{unit} наприкінці",
		middle: "{duration} посередині",
		beforeNone: "Жодна задача не закінчується до початку цієї.",
		before: {
			one: "{count} закінчується до початку цієї: {name}, кінець {date}.",
			few: "{count} закінчуються до початку цієї. Найближча: {name}, кінець {date}.",
			many: "{count} закінчуються до початку цієї. Найближча: {name}, кінець {date}.",
			other: "{count} закінчуються до початку цієї. Найближча: {name}, кінець {date}."
		},
		afterNone: "Жодна задача не починається після закінчення цієї.",
		after: {
			one: "{count} починається після закінчення цієї: {name}, початок {date}.",
			few: "{count} починаються після закінчення цієї. Найближча: {name}, початок {date}.",
			many: "{count} починаються після закінчення цієї. Найближча: {name}, початок {date}.",
			other: "{count} починаються після закінчення цієї. Найближча: {name}, початок {date}."
		}
	},

	conflicts: {
		tooEarlyFor: "Конфлікт із задачею «{other}». Зарано, різниця {amount}.",
		otherTooEarly: "Конфлікт. Задача «{other}» тепер зарано, різниця {amount}.",
		several: "{count}. Найбільший: із задачею «{other}», різниця {amount}.",
		severalOther: "{count}. Найбільший: задача «{other}», різниця {amount}.",
		resolved: "Конфлікт усунено.",
		brief: "Конфлікт: {other}.",
		detailed: "Конфлікт. Зарано, різниця {amount}: {rule}.",
		detailedOther: "Конфлікт. Задача «{other}» тепер зарано, різниця {amount}: {rule}.",
		rule: {
			finish_to_start: "не може початися, поки не закінчиться «{other}»",
			start_to_start: "не може початися раніше, ніж почнеться «{other}»",
			finish_to_finish: "не може закінчитися раніше, ніж закінчиться «{other}»",
			start_to_finish: "не може закінчитися раніше, ніж почнеться «{other}»"
		},
		ruleLag: {
			finish_to_start: "має початися після закінчення «{other}», із запасом щонайменше: {lag}",
			start_to_start: "має початися після початку «{other}», із запасом щонайменше: {lag}",
			finish_to_finish: "має закінчитися після закінчення «{other}», із запасом щонайменше: {lag}",
			start_to_finish: "має закінчитися після початку «{other}», із запасом щонайменше: {lag}"
		},
		ruleLead: {
			finish_to_start: "може початися до закінчення «{other}», але не раніше ніж за: {lag}",
			start_to_start: "може початися до початку «{other}», але не раніше ніж за: {lag}",
			finish_to_finish: "може закінчитися до закінчення «{other}», але не раніше ніж за: {lag}",
			start_to_finish: "може закінчитися до початку «{other}», але не раніше ніж за: {lag}"
		}
	},

	edit: {
		moved: "Початок {start}, кінець {end}.",
		movedBrief: "{range}.",
		milestoneMoved: "{date}.",
		later: "Пізніше, {delta}.",
		earlier: "Раніше, {delta}.",
		back: "Знову на початковому місці. {range}.",
		duration: "{duration}. Кінець {end}.",
		durationBrief: "{duration}.",
		durationAtMinimum: "{duration}, це мінімум. Кінець {end}.",
		longer: "Довше, {delta}.",
		shorter: "Коротше, {delta}.",
		minimum: "Уже {duration}, це мінімум.",
		readonly: "Лише для читання. Не змінено.",
		readonlyBrief: "Лише для читання.",
		project: "Не змінено. Проєкт бере дати від своїх підзадач.",
		milestone: "Віха не має тривалості.",
		rejected: "Не змінено. Зміну не прийнято."
	},

	form: {
		saved: "Збережено.",
		change: "{field}: {to}, було {from}.",
		ends: "Кінець {date}.",
		savedCount: "Збережено, {count}: {list}.",
		savedCountOnly: "Збережено, {count}.",
		noChanges: "Збережено, без змін.",
		cancelled: "Скасовано. Нічого не змінено.",
		created: "Створено: {name}.",
		discarded: "Нову задачу відкинуто.",
		deleted: "Видалено: {name}.",
		deletedWithSubtasks: "Видалено: {name} і {subtasks}.",
		linksRemoved: "Видалено {links}.",
		value: "{field}: {value}.",
		// "%" lets the screen reader pick the plural form of "відсоток".
		percent: "{value}%",
		noParent: "немає"
	},

	rowLabel: {
		name: "{name}.",
		parent: "У складі: {name}.",
		span: "{range}, {duration}.",
		spanBrief: "{start}, {duration}.",
		spanDetailed: "Початок {start}. Кінець {end}. {duration}.",
		progress: "Виконано {value}%.",
		notScheduled: "Не заплановано.",
		noDuration: "{date}, без тривалості.",
		milestone: "Віха, {date}.",
		project: "Проєкт, {range}, {count}.",
		conflictsInside: "Усередині: {count}."
	},

	links: {
		marked: "Зв'язок від: {name}.",
		type: "Тип: {type}.",
		cancelled: "Зв'язок скасовано.",
		created: "Зв'язок створено. Ця задача залежить від: {name}.",
		createdTyped: "Зв'язок створено. Ця задача залежить від: {name}, {type}.",
		notCreated: {
			same: "Зв'язок не створено. Задача не може залежати від себе.",
			exists: "Зв'язок не створено. Ця задача вже залежить від: {name}.",
			loop: "Зв'язок не створено. Утвориться цикл: {name} уже залежить від цієї задачі.",
			notAllowed: "Зв'язок не створено. Тут не дозволено.",
			failed: "Зв'язок не створено."
		},
		confirmRemovePredecessor: "Натисніть ще раз, щоб видалити зв'язок: {name} залежить від цієї задачі.",
		confirmRemoveSuccessor: "Натисніть ще раз, щоб видалити залежність цієї задачі від: {name}.",
		removedPredecessor: "Зв'язок видалено. {name} більше не залежить від цієї задачі.",
		removedSuccessor: "Зв'язок видалено. Ця задача більше не залежить від: {name}.",
		notRemoved: "Зв'язок не видалено.",
		noContext: "Нічого видаляти. Спершу перейдіть до пов'язаної задачі клавішами переходу.",
		noSource: "Не позначено задачі для зв'язку. Спершу натисніть {key} на задачі."
	},

	linkHints: {
		marked: "Перейдіть до задачі, яка від неї залежатиме, і натисніть {key}."
	},

	keys: {
		shift: "Shift",
		alt: "Alt",
		ctrl: "Control",
		meta: "Command",
		left: "стрілка ліворуч",
		right: "стрілка праворуч",
		up: "стрілка вгору",
		down: "стрілка вниз",
		enter: "Enter",
		space: "Пробіл",
		delete: "Delete",
		pageup: "Page Up",
		pagedown: "Page Down",
		home: "Home",
		end: "End",
		esc: "Escape"
	},

	help: {
		group: "{group}, {n} з {total}.",
		item: "{action}: клавіші {key}.",
		groups: {
			reading: "Читання",
			orientation: "Орієнтація",
			moving: "Переміщення фокуса",
			changing: "Зміни",
			links: "Зв'язки",
			other: "Інше"
		}
	},

	meta: {
		nothingToRepeat: "Нічого повторювати."
	}
};

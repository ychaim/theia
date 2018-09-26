/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable, inject } from 'inversify';
import { ILogger } from './logger';
import { Event } from '../common/event';

export const messageServicePath = '/services/messageService';

export enum MessageType {
    Error = 1,
    Warning = 2,
    Info = 3,
    Log = 4,
    Progress = 5
}

export interface MessageArguments {
    type: MessageType;
    text: string;
    actions?: string[];
    options?: MessageOptions;
}

export interface ProgressMessage {
    show(): void;
    close(): void;
    update(item: { message?: string, increment?: number }): void;
    onCancel: Event<void>;
}

export interface ProgressMessageArguments {
    text: string;
    actions?: string[];
}

export interface MessageOptions {
    timeout?: number;
}

@injectable()
export class MessageClient {

    constructor(@inject(ILogger) protected readonly logger: ILogger) { }

    /**
     * Show a message of the given type and possible actions to the user.
     * Resolve to a chosen action.
     * Never reject.
     *
     * To be implemented by an extension, e.g. by the messages extension.
     */
    showMessage(message: MessageArguments): Promise<string | undefined> {
        this.logger.info(message.text);
        return Promise.resolve(undefined);
    }

    /**
     * Create progress message instance.
     * If a progress message with given text is already shown, returns the shown instance.
     *
     * To be implemented by an extension, e.g. by the messages extension.
     */
    getOrCreateProgressMessage(message: ProgressMessageArguments): ProgressMessage | undefined {
        this.logger.info(message.text);
        return undefined;
    }}

@injectable()
export class DispatchingMessageClient extends MessageClient {

    readonly clients = new Set<MessageClient>();

    showMessage(message: MessageArguments): Promise<string | undefined> {
        return Promise.race([...this.clients].map(client =>
            client.showMessage(message)
        ));
    }

}

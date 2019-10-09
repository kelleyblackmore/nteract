import { createMessage, ofMessageType } from "@nteract/messaging";
import { ofType } from "redux-observable";
import { ActionsObservable } from "redux-observable";
import { merge } from "rxjs";
import { map, retry, switchMap, takeUntil } from "rxjs/operators";

import {
  commMessageAction,
  commOpenAction,
  KILL_KERNEL_SUCCESSFUL,
  LAUNCH_KERNEL_SUCCESSFUL,
  NewKernelAction
} from "@nteract/actions";

/**
 * creates a comm open message
 * @param  {string} comm_id       uuid
 * @param  {string} target_name   comm handler
 * @param  {any} data             up to the target handler
 * @param  {string} target_module [Optional] used to select a module that is responsible for handling the target_name
 * @return {jmp.Message}          Message ready to send on the shell channel
 */
export function createCommOpenMessage(
  comm_id: string,
  target_name: string,
  data: any = {},
  target_module: string
) {
  const msg = createMessage("comm_open", {
    content: { comm_id, target_name, data }
  });
  if (target_module) {
    msg.content.target_module = target_module;
  }
  return msg;
}

/**
 * creates a comm message for sending to a kernel
 * @param  {string}     comm_id    unique identifier for the comm
 * @param  {Object}     data       any data to send for the comm
 * @param  {Uint8Array} buffers    arbitrary binary data to send on the comm
 * @return {jmp.Message}           jupyter message for comm_msg
 */
export function createCommMessage(
  comm_id: string,
  data: any = {},
  buffers: Uint8Array = new Uint8Array([])
) {
  return createMessage("comm_msg", { content: { comm_id, data }, buffers });
}

/**
 * creates a comm close message for sending to a kernel
 * @param  {Object} parent_header    header from a parent jupyter message
 * @param  {string}     comm_id      unique identifier for the comm
 * @param  {Object}     data         any data to send for the comm
 * @return {jmp.Message}             jupyter message for comm_msg
 */
export function createCommCloseMessage(
  parent_header: any,
  comm_id: string,
  data: any = {}
) {
  return createMessage("comm_close", {
    content: { comm_id, data },
    parent_header
  });
}

/**
 * An epic that emits comm actions from the backend kernel
 * @param  {ActionsObservable} action$ Action Observable from redux-observable
 * @param  {redux.Store} store   the redux store
 * @return {ActionsObservable}         Comm actions
 */
export const commListenEpic = (action$: ActionsObservable<NewKernelAction>) =>
  action$.pipe(
    // A LAUNCH_KERNEL_SUCCESSFUL action indicates we have a new channel
    ofType(LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: NewKernelAction) => {
      const {
        payload: { kernel }
      } = action;
      // Listen on the comms channel until KILL_KERNEL_SUCCESSFUL is emitted
      const commOpenAction$ = kernel.channels.pipe(
        ofMessageType("comm_open"),
        map(commOpenAction),
        takeUntil(action$.pipe(ofType(KILL_KERNEL_SUCCESSFUL)))
      );

      const commMessageAction$ = kernel.channels.pipe(
        ofMessageType("comm_msg"),
        map(commMessageAction),
        takeUntil(action$.pipe(ofType(KILL_KERNEL_SUCCESSFUL)))
      );

      return merge(commOpenAction$, commMessageAction$);
    })
  );

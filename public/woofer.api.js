'use strict'
var RestfulSvc = angular.module('woofer.api', [])

RestfulSvc.factory('RESTapi', ['$resource', function ($resource) {
    /**
     * Restful API version. it must be attached the called url.
     */
  var prefixUrl = ''
    /**
     * @domain : biz object ex) person
     * @key : biz object id ex) persion id is 123
     * @action : server action name. if it exist, you can define or not.
     * ex) http://www.bennadel.com/blog/2433-Using-RESTful-Controllers-In-An-AngularJS-Resource.htm
     *
     * add a update action for method of PUT
     */
  return $resource(
        // 호출하는 url 형식
            prefixUrl + '/:svc/:func',
        // 호출 url 형식의 :domain :key :action 에 동적으로 받게 되는 파라미터
    {
      svc: '@svc',
      func: '@func'
    }
    )
}])

RestfulSvc.factory('apiSvc', function (RESTapi) {
  var Svc = {
  }
  return Svc
})

$(document).ready(function(){
    var data = 'user_script=%23include%20%3Cstdio.h%3E%0A%0Aint%20main%28%29%0A{%0A%0A%20%20%20%20int%20a[30]%2C%20item%2C%20i%2C%20mid%2C%20top%2C%20bottom%3B%0A%20%20%20%20%0A%20%20%20%20a[0]%20%3D%201%3B%0A%20%20%20%20a[1]%20%3D%203%3B%0A%20%20%20%20a[2]%20%3D%205%3B%0A%20%20%20%20a[3]%20%3D%207%3B%0A%20%20%20%20a[4]%20%3D%208%3B%0A%20%20%20%20a[5]%20%3D%2013%3B%0A%20%20%20%20a[6]%20%3D%2014%3B%0A%20%20%20%20a[7]%20%3D%2015%3B%0A%20%20%20%20a[8]%20%3D%2016%3B%0A%20%20%20%20a[9]%20%3D%2019%3B%0A%20%20%20%20a[10]%20%3D%2021%3B%0A%20%20%20%20a[11]%20%3D%2031%3B%0A%20%20%20%20a[12]%20%3D%2051%3B%0A%20%20%20%20%0A%20%20%20%20item%20%3D%2013%3B%0A%20%20%20%20bottom%20%3D%201%3B%0A%20%20%20%20top%20%3D%2013%3B%0A%0A%20%20%20%20do%0A%20%20%20%20{%0A%20%20%20%20%20%20%20%20mid%20%3D%20%28bottom%20%2B%20top%29%20%2F%202%3B%0A%20%20%20%20%20%20%20%20if%20%28item%20%3C%20a[mid]%29%0A%20%20%20%20%20%20%20%20%20%20%20%20top%20%3D%20mid%20-%201%3B%0A%20%20%20%20%20%20%20%20else%20if%20%28item%20%3E%20a[mid]%29%0A%20%20%20%20%20%20%20%20%20%20%20%20bottom%20%3D%20mid%20%2B%201%3B%0A%20%20%20%20}%20while%20%28item%20!%3D%20a[mid]%20%26%26%20bottom%20%3C%3D%20top%29%3B%0A%0A%20%20%20%20if%20%28item%20%3D%3D%20a[mid]%29%0A%20%20%20%20{%0A%20%20%20%20%20%20%20%20printf%28%22Binary%20search%20successfull!!\n%22%29%3B%0A%20%20%20%20%20%20%20%20printf%28%22\n%20%25d%20found%20in%20position%3A%20%25d\n%22%2C%20item%2C%20mid%20%2B%201%29%3B%0A%20%20%20%20}%0A%20%20%20%20else%0A%20%20%20%20{%0A%20%20%20%20%20%20%20%20printf%28%22\n%20%20Search%20failed\n%20%25d%20not%20found\n%22%2C%20item%29%3B%0A%20%20%20%20}%0A%20%20%20%20%0A%20%20%20%20return%200%3B%0A}&options_json={%22cumulative_mode%22%3Afalse%2C%22heap_primitives%22%3Afalse%2C%22show_only_outputs%22%3Afalse%2C%22origin%22%3A%22opt-frontend.js%22}&user_uuid=66eb87fc-1b54-4a21-b106-34144b9c78a3&session_uuid=d43ca576-5469-47ba-d0d2-49cbcd082d7e&diffs_json=HTTP/1.1';
 
    $.ajax({
        type: 'POST',
        url: 'http://104.237.139.253:3000/exec_c_jsonp',
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function () { alert('Success'); },
        error: function () { alert('Error'); }
    });
    return 0;
});